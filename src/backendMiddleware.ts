import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { CredentialMetadataSummary, Storage } from 'src/lib/storage/storage'
import { KeyChain, KeyChainInterface } from 'src/lib/keychain'
import { ConnectionOptions } from 'typeorm/browser'
import {
  createJolocomRegistry,
  JolocomRegistry,
} from 'jolocom-lib/js/registries/jolocomRegistry'
import { IpfsCustomConnector } from './lib/ipfs'
import { jolocomContractsAdapter } from 'jolocom-lib/js/contracts/contractsAdapter'
import { jolocomEthereumResolver } from 'jolocom-lib/js/ethereum/ethereum'
import { jolocomContractsGateway } from 'jolocom-lib/js/contracts/contractsGateway'
import { JolocomLib } from 'jolocom-lib'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import { Identity } from 'jolocom-lib/js/identity/identity'
import {
  EncryptedData,
  SoftwareKeyProvider,
} from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { generateSecureRandomBytes } from './lib/util'
import { BackupData, backupData, deleteBackup, fetchBackup } from './lib/backup'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { isEmpty } from 'ramda'

export enum ErrorCodes {
  NoEntropy = 'NoEntropy',
  NoKeyProvider = 'NoKeyProvider',
  NoWallet = 'NoWallet',
  DecryptionFailed = 'DecryptionFailed',
}

export class BackendError extends Error {
  public static codes = ErrorCodes

  public constructor(code: ErrorCodes) {
    super(code)
  }
}

export class BackendMiddleware {
  private _identityWallet!: IdentityWallet
  private _keyProvider!: SoftwareKeyProvider

  public storageLib: Storage
  public keyChainLib: KeyChainInterface
  public registry: JolocomRegistry

  public constructor(config: {
    fuelingEndpoint: string
    typeOrmConfig: ConnectionOptions
  }) {
    this.storageLib = new Storage(config.typeOrmConfig)
    this.keyChainLib = new KeyChain()
    this.registry = createJolocomRegistry({
      ipfsConnector: new IpfsCustomConnector({
        host: 'ipfs.jolocom.com',
        port: 443,
        protocol: 'https',
      }),
      ethereumConnector: jolocomEthereumResolver,
      contracts: {
        adapter: jolocomContractsAdapter,
        gateway: jolocomContractsGateway,
      },
    })
  }

  public async initStorage(): Promise<void> {
    await this.storageLib.initConnection()
  }

  public get identityWallet(): IdentityWallet {
    if (this._identityWallet) return this._identityWallet
    throw new BackendError(ErrorCodes.NoWallet)
  }

  public get keyProvider(): SoftwareKeyProvider {
    if (this._keyProvider) return this._keyProvider
    throw new BackendError(ErrorCodes.NoKeyProvider)
  }

  public async prepareIdentityWallet(): Promise<IdentityWallet> {
    if (this._identityWallet) return this._identityWallet

    const encryptedEntropy = await this.storageLib.get.encryptedSeed()
    let encryptionPass
    try {
      encryptionPass = await this.keyChainLib.getPassword()
    } catch (e) {
      // This may fail if the application was uninstalled and reinstalled, as
      // the android keystore is cleared on uninstall, but the database may
      // still remain, due to having been auto backed up!
      // FIXME: Sentry.captureException(e)
    }

    if (encryptedEntropy && !encryptionPass) {
      // if we can't decrypt the encryptedEntropy, then reset the database
      console.warn('DROPPING OLD DB')
      await this.storageLib.resetDatabase()
    }

    if (!encryptedEntropy || !encryptionPass) {
      // If either encryptedEntropy or encryptionPass was missing, we throw
      // NoEntropy to signal that we cannot prepare an identityWallet instance due
      // to lack of a seed.
      // Note that the case of having an encryptionPass but no encryptedEntropy
      // is an uncommon edge case, but may potentially happen due to errors/bugs
      // etc
      throw new BackendError(ErrorCodes.NoEntropy)
    }

    this._keyProvider = new JolocomLib.KeyProvider(
      Buffer.from(encryptedEntropy, 'hex'),
    )
    const { jolocomIdentityKey: derivationPath } = JolocomLib.KeyTypes

    const userPubKey = this._keyProvider.getPublicKey({
      derivationPath,
      encryptionPass,
    })

    const didDocument = await this.storageLib.get.didDoc(
      publicKeyToDID(userPubKey),
    )

    if (didDocument) {
      const identity = Identity.fromDidDocument({ didDocument })

      // TODO Simplify constructor
      return (this._identityWallet = new IdentityWallet({
        identity,
        vaultedKeyProvider: this._keyProvider,
        publicKeyMetadata: {
          derivationPath,
          keyId: identity.publicKeySection[0].id,
        },
        contractsAdapter: this.registry.contractsAdapter,
        contractsGateway: this.registry.contractsGateway,
      }))
    } else {
      const identityWallet = await this.registry.authenticate(
        this._keyProvider,
        {
          encryptionPass,
          derivationPath,
        },
      )

      await this.storageLib.store.didDoc(identityWallet.didDocument)
      return (this._identityWallet = identityWallet)
    }
  }

  public async backupData(
    shouldUpload: boolean,
  ): Promise<void | EncryptedData> {
    const credentials = await this.storageLib.get.verifiableCredential()
    const credentialMetadata = [] as CredentialMetadataSummary[]
    for (const cred of credentials) {
      const metadata = await this.storageLib.get.credentialMetadata(cred)
      if (!isEmpty(metadata)) {
        metadata.issuer = await this.storageLib.get.publicProfile(
          metadata.issuer,
        )
        credentialMetadata.push(metadata)
      }
    }
    const data: BackupData = {
      did: this._identityWallet.did,
      credentials: credentials.map(cred => cred.toJSON()),
      credentialMetadata,
    }

    const password = await this.keyChainLib.getPassword()
    return backupData(data, this._keyProvider, password, shouldUpload)
  }

  public async deleteBackup(): Promise<void> {
    const password = await this.keyChainLib.getPassword()
    return deleteBackup(this._keyProvider, password)
  }

  public async recoverKeyProvider(seedPhrase: string): Promise<string> {
    const password = (await generateSecureRandomBytes(32)).toString('base64')
    this._keyProvider = JolocomLib.KeyProvider.recoverKeyPair(
      seedPhrase,
      password,
    )
    // if the recovery process fails, the password in the keychain will be overwritten in the next try
    await this.keyChainLib.savePassword(password)
    return this._keyProvider
      .getPublicKey({
        derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
        encryptionPass: password,
      })
      .toString('hex')
  }

  public async decryptBackup(
    encryptedBackup: EncryptedData,
  ): Promise<BackupData> {
    const password = await this.keyChainLib.getPassword()
    const backup = await this._keyProvider.decryptHybrid(encryptedBackup, {
      encryptionPass: password,
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    })
    return backup as BackupData
  }
  public async fetchBackup(): Promise<EncryptedData | undefined> {
    const password = await this.keyChainLib.getPassword()
    return await fetchBackup(this._keyProvider, password)
  }

  public async recoverData(data: BackupData): Promise<void> {
    if (!data.did) throw new Error('Missing DID in backup')

    // Persona is already stored in recoverIdentity (needed to store credentials because of a foreignKey from credentials to persona.did
    if (data.credentials) {
      for (let i = 0; i < data.credentials.length; i++) {
        const credential = SignedCredential.fromJSON(data.credentials[i])
        await this.storageLib.store.verifiableCredential(credential)
      }
    }
    if (data.credentialMetadata) {
      for (const metadata of data.credentialMetadata) {
        if (metadata) {
          await this.storageLib.store.credentialMetadata(metadata)
          await this.storageLib.store.issuerProfile(metadata.issuer)
        }
      }
    }
  }

  public async recoverIdentity(did?: string): Promise<Identity> {
    const password = await this.keyChainLib.getPassword()
    const { jolocomIdentityKey: derivationPath } = JolocomLib.KeyTypes

    const identityWallet = await this.registry.authenticate(
      this._keyProvider,
      {
        encryptionPass: password,
        derivationPath,
      },
      did,
    )
    this._identityWallet = identityWallet
    await this.storeIdentityData()
    return identityWallet.identity
  }

  public async createKeyProvider(encodedEntropy: string): Promise<void> {
    const password = (await generateSecureRandomBytes(32)).toString('base64')
    this._keyProvider = JolocomLib.KeyProvider.fromSeed(
      Buffer.from(encodedEntropy, 'hex'),
      password,
    )
    await this.keyChainLib.savePassword(password)
  }

  public async fuelKeyWithEther(): Promise<void> {
    const password = await this.keyChainLib.getPassword()
    await JolocomLib.util.fuelKeyWithEther(
      this.keyProvider.getPublicKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey,
      }),
    )
  }

  public async createIdentity(): Promise<Identity> {
    const password = await this.keyChainLib.getPassword()
    this._identityWallet = await this.registry.create(
      this.keyProvider,
      password,
    )
    await this.storeIdentityData()
    return this._identityWallet.identity
  }

  private async storeIdentityData(): Promise<void> {
    const personaData = {
      did: this._identityWallet.identity.did,
      controllingKeyPath: JolocomLib.KeyTypes.jolocomIdentityKey,
    }
    await this.storageLib.store.persona(personaData)
    const encryptedSeedData = {
      encryptedEntropy: this.keyProvider.encryptedSeed,
      timestamp: Date.now(),
    }
    await this.storageLib.store.encryptedSeed(encryptedSeedData)
    await this.storageLib.store.didDoc(this._identityWallet.didDocument)
  }
}
