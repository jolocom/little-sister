import {
  Connection,
  ConnectionOptions,
  createConnection,
} from 'typeorm/browser'
import { plainToClass } from 'class-transformer'
import {
  SettingEntity,
  PersonaEntity,
  MasterKeyEntity,
  SignatureEntity,
  CredentialEntity,
  CacheEntity,
  VerifiableCredentialEntity,
} from 'src/lib/storage/entities'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { IdentitySummary } from '../../actions/sso/types'
import { EncryptionLib } from '../crypto'

interface PersonaAttributes {
  did: string
  controllingKeyPath: string
}

interface EncryptedSeedAttributes {
  entropy: string
  timestamp: number
}

interface ModifiedCredentialEntity {
  propertyName: string
  propertyValue: string[]
  verifiableCredential: VerifiableCredentialEntity
}

export class Storage {
  private connection!: Connection
  private config: ConnectionOptions

  public store = {
    setting: this.saveSetting.bind(this),
    persona: this.storePersonaFromJSON.bind(this),
    verifiableCredential: this.storeVClaim.bind(this),
    seedEncrypted: this.storeSeedEncrypted.bind(this),
    credentialMetadata: (metadata: CredentialMetadataSummary) =>
      this.createConnectionIfNeeded().then(() =>
        storeCredentialMetadata(this.connection)(metadata),
      ),
    issuerProfile: (issuer: IdentitySummary) =>
      this.createConnectionIfNeeded().then(() =>
        storeIssuerProfile(this.connection)(issuer),
      ),
  }

  public get = {
    settingsObject: this.getSettingsObject.bind(this),
    setting: this.getSetting.bind(this),
    persona: this.getPersonas.bind(this),
    verifiableCredential: this.getVCredential.bind(this),
    attributesByType: this.getAttributesByType.bind(this),
    vCredentialsByAttributeValue: this.getVCredentialsForAttribute.bind(this),
    encryptedSeed: this.getEncryptedSeed.bind(this),
    credentialMetadata: (credential: SignedCredential) =>
      this.createConnectionIfNeeded().then(() =>
        getMetadataForCredential(this.connection)(credential),
      ),
    publicProfile: (did: string) =>
      this.createConnectionIfNeeded().then(() =>
        getPublicProfile(this.connection)(did),
      ),
  }

  public delete = {
    verifiableCredential: this.deleteVCred.bind(this),
    // credentialMetadata: this.deleteCredentialMetadata.bind(this)
  }

  public initConnection = this.createConnectionIfNeeded.bind(this)

  public constructor(config: ConnectionOptions) {
    this.config = config
  }

  private async createConnectionIfNeeded(): Promise<void> {
    if (!this.connection) {
      this.connection = await createConnection(this.config)
    }
  }

  private async getSettingsObject(): Promise<{ [key: string]: any }> {
    await this.createConnectionIfNeeded()
    const settingsList = await this.connection.manager.find(SettingEntity)
    const settings = {}
    settingsList.forEach(setting => {
      settings[setting.key] = setting.value
    })
    return settings
  }

  private async getSetting(key: string): Promise<any> {
    await this.createConnectionIfNeeded()
    const setting = await this.connection.manager.findOne(SettingEntity, {
      key,
    })
    if (setting) return setting.value
  }

  private async saveSetting(key: string, value: any): Promise<void> {
    await this.createConnectionIfNeeded()
    const repo = this.connection.getRepository(SettingEntity)
    const setting = repo.create({ key, value })
    await repo.save(setting)
  }

  // TODO: refactor needed on multiple personas
  private async getPersonas(query?: object): Promise<PersonaEntity[]> {
    await this.createConnectionIfNeeded()
    return this.connection.manager.find(PersonaEntity)
  }

  private async getVCredential(query?: object): Promise<SignedCredential[]> {
    await this.createConnectionIfNeeded()
    const entities = await this.connection.manager.find(
      VerifiableCredentialEntity,
      {
        where: query,
        relations: ['claim', 'proof', 'subject'],
      },
    )

    return entities.map(e => e.toVerifiableCredential())
  }

  private async getAttributesByType(type: string[]) {
    await this.createConnectionIfNeeded()
    const localAttributes = await this.connection
      .getRepository(CredentialEntity)
      .createQueryBuilder('credential')
      .leftJoinAndSelect(
        'credential.verifiableCredential',
        'verifiableCredential',
      )
      .where('verifiableCredential.type = :type', { type })
      .getMany()

    const results = this.groupAttributesByCredentialId(localAttributes).map(
      entry => ({
        verification: entry.verifiableCredential.id,
        values: entry.propertyValue,
        fieldName: entry.propertyName,
      }),
    )

    return { type, results }
  }

  // TODO rework
  private groupAttributesByCredentialId(
    attributes: CredentialEntity[],
  ): ModifiedCredentialEntity[] {
    // Convert values to arrays for easier concatination later
    const modifiedAttributes = attributes.map(attr => ({
      ...attr,
      propertyValue: [attr.propertyValue],
    }))

    // Helper function
    const findByCredId = (
      arrToSearch: ModifiedCredentialEntity[],
      value: ModifiedCredentialEntity,
    ) =>
      arrToSearch.findIndex(
        entry =>
          entry.verifiableCredential.id === value.verifiableCredential.id,
      )

    return modifiedAttributes.reduce(
      (acc: ModifiedCredentialEntity[], curr: ModifiedCredentialEntity) => {
        const matchingIndex = findByCredId(acc, curr)

        if (matchingIndex >= 0) {
          acc[matchingIndex].propertyValue = [
            ...acc[matchingIndex].propertyValue,
            ...curr.propertyValue,
          ]
          return acc
        } else {
          return [...acc, curr]
        }
      },
      [],
    )
  }

  private async getVCredentialsForAttribute(
    attribute: string,
  ): Promise<SignedCredential[]> {
    await this.createConnectionIfNeeded()
    const entities = await this.connection
      .getRepository(VerifiableCredentialEntity)
      .createQueryBuilder('verifiableCredential')
      .leftJoinAndSelect('verifiableCredential.claim', 'claim')
      .leftJoinAndSelect('verifiableCredential.proof', 'proof')
      .leftJoinAndSelect('verifiableCredential.subject', 'subject')
      .where('claim.propertyValue = :attribute', { attribute })
      .getMany()

    return entities.map(e => e.toVerifiableCredential())
  }

  private async getEncryptedSeed(): Promise<string | null> {
    await this.createConnectionIfNeeded()
    const masterKeyEntity = await this.connection.manager.find(MasterKeyEntity)
    if (masterKeyEntity.length) {
      return masterKeyEntity[0].encryptedEntropy
    }
    return null
  }

  private async storePersonaFromJSON(args: PersonaAttributes): Promise<void> {
    await this.createConnectionIfNeeded()
    const persona = plainToClass(PersonaEntity, args)
    await this.connection.manager.save(persona)
  }

  private async storeSeedEncrypted(
    args: EncryptedSeedAttributes,
    password: string,
  ): Promise<void> {
    await this.createConnectionIfNeeded()
    const encryptedEntropy = EncryptionLib.encryptWithPass({
      data: args.entropy,
      pass: password,
    })
    const encryptedSeed = plainToClass(MasterKeyEntity, {
      encryptedEntropy,
      timestamp: args.timestamp,
    })
    await this.connection.manager.save(encryptedSeed)
  }

  private async storeVClaim(vCred: SignedCredential): Promise<void> {
    await this.createConnectionIfNeeded()
    const verifiableCredential = VerifiableCredentialEntity.fromVerifiableCredential(
      vCred,
    )

    const signature = SignatureEntity.fromLinkedDataSignature(vCred.proof)

    const claims = CredentialEntity.fromVerifiableCredential(vCred)
    claims.forEach(claim => (claim.verifiableCredential = verifiableCredential))

    signature.verifiableCredential = verifiableCredential

    verifiableCredential.proof = [signature]
    verifiableCredential.claim = claims

    await this.connection.manager.save(verifiableCredential)
  }

  private async deleteVCred(id: string): Promise<void> {
    await this.createConnectionIfNeeded()
    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(CredentialEntity)
      .where('verifiableCredential = :id', { id })
      .execute()

    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(SignatureEntity)
      .where('verifiableCredential = :id', { id })
      .delete()
      .execute()

    await this.connection.manager
      .createQueryBuilder()
      .delete()
      .from(VerifiableCredentialEntity)
      .where('id = :id', { id })
      .execute()
  }
}

export interface CredentialMetadata {
  type: string
  renderInfo: CredentialOfferRenderInfo
  metadata: CredentialOfferMetadata
}

export interface CredentialMetadataSummary extends CredentialMetadata {
  issuer: IdentitySummary
}

const storeCredentialMetadata = (connection: Connection) => (
  credentialMetadata: CredentialMetadataSummary,
) => {
  const { issuer, type: credentialType } = credentialMetadata

  const cacheEntry = plainToClass(CacheEntity, {
    key: buildMetadataKey(issuer.did, credentialType),
    value: { ...credentialMetadata, issuer: credentialMetadata.issuer.did },
  })

  return connection.manager.save(cacheEntry)
}

const getMetadataForCredential = (connection: Connection) => async ({
  issuer,
  type: credentialType,
}: SignedCredential) => {
  const entryKey = buildMetadataKey(issuer, credentialType)
  const [entry] = await connection.manager.findByIds(CacheEntity, [entryKey])
  return (entry && entry.value) || {}
}

const buildMetadataKey = (
  issuer: string,
  credentialType: string | string[],
): string => {
  if (typeof credentialType === 'string') {
    return `${issuer}${credentialType}`
  }

  return `${issuer}${credentialType[credentialType.length - 1]}`
}
const storeIssuerProfile = (connection: Connection) => (
  issuer: IdentitySummary,
) => {
  const cacheEntry = plainToClass(CacheEntity, {
    key: issuer.did,
    value: issuer,
  })

  return connection.manager.save(cacheEntry)
}

const getPublicProfile = (connection: Connection) => async (did: string) => {
  const [issuerProfile] = await connection.manager.findByIds(CacheEntity, [did])
  return (issuerProfile && issuerProfile.value) || { did }
}
