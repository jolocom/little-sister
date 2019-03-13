import {
  createConnection,
  ConnectionOptions,
  Connection,
} from 'typeorm/browser'
import { plainToClass } from 'class-transformer'
import {
  PersonaEntity,
  MasterKeyEntity,
  VerifiableCredentialEntity,
  SignatureEntity,
  CredentialEntity,
} from 'src/lib/storage/entities'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'

interface PersonaAttributes {
  did: string
  controllingKeyPath: string
}

interface EncryptedSeedAttributes {
  encryptedEntropy: string
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

  store = {
    verifiableCredential: this.storeVClaim.bind(this),
    persona: this.storePersonaFromJSON.bind(this),
    encryptedSeed: this.storeEncryptedSeed.bind(this),
  }

  get = {
    persona: this.getPersonas.bind(this),
    verifiableCredential: this.getVCredential.bind(this),
    attributesByType: this.getAttributesByType.bind(this),
    vCredentialsByAttributeValue: this.getVCredentialsForAttribute.bind(this),
    encryptedSeed: this.getEncryptedSeed.bind(this),
  }

  delete = {
    verifiableCredential: this.deleteVCred.bind(this),
  }

  constructor(config: ConnectionOptions) {
    this.config = config
  }

  private async createConnectionIfNeeded(): Promise<void> {
    if (!this.connection) {
      this.connection = await createConnection(this.config)
    }
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

  private async getEncryptedSeed(): Promise<string> {
    await this.createConnectionIfNeeded()
    const masterKeyEntity = await this.connection.manager.find(MasterKeyEntity)
    return masterKeyEntity[0].encryptedEntropy
  }

  private async storePersonaFromJSON(args: PersonaAttributes): Promise<void> {
    await this.createConnectionIfNeeded()
    const persona = plainToClass(PersonaEntity, args)
    await this.connection.manager.save(persona)
  }

  private async storeEncryptedSeed(
    args: EncryptedSeedAttributes,
  ): Promise<void> {
    await this.createConnectionIfNeeded()
    const encryptedSeed = plainToClass(MasterKeyEntity, args)
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
