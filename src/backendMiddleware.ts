import { JolocomLib } from 'jolocom-lib'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { EncryptionLib, EncryptionLibInterface } from 'src/lib/crypto'
import { Storage } from 'src/lib/storage/storage'
import { KeyChain, KeyChainInterface } from 'src/lib/keychain'
import { ConnectionOptions } from 'typeorm/browser'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { IRegistry } from 'jolocom-lib/js/registries/types'
import { createJolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry'
import {
  getStaxConfiguredContractsConnector,
  getStaxConfiguredContractsGateway,
  getStaxConfiguredStorageConnector,
} from 'jolocom-lib-stax-connector'
import { ContractsAdapter } from 'jolocom-lib/js/contracts/contractsAdapter'
import { httpAgent } from './lib/http'

export const staxDeployment = ''
const contractAddress = ''
const staxChainId = 0

export class BackendMiddleware {
  public identityWallet!: IdentityWallet
  public storageLib: Storage
  public encryptionLib: EncryptionLibInterface
  public keyChainLib: KeyChainInterface
  public registry: IRegistry

  public constructor(config: {
    fuelingEndpoint: string
    typeOrmConfig: ConnectionOptions
  }) {
    this.storageLib = new Storage(config.typeOrmConfig)
    this.encryptionLib = new EncryptionLib()
    this.keyChainLib = new KeyChain()
    this.registry = createJolocomRegistry({
      ethereumConnector: getStaxConfiguredContractsConnector(
        staxDeployment,
        contractAddress,
        httpAgent,
      ),
      ipfsConnector: getStaxConfiguredStorageConnector(
        staxDeployment,
        httpAgent,
      ),
      contracts: {
        gateway: getStaxConfiguredContractsGateway(
          staxDeployment,
          staxChainId,
          httpAgent,
        ),
        adapter: new ContractsAdapter(staxChainId),
      },
    })
  }

  public async initStorage(): Promise<void> {
    await this.storageLib.initConnection()
  }

  public async setIdentityWallet(
    userVault: SoftwareKeyProvider,
    pass: string,
  ): Promise<void> {
    const { jolocomIdentityKey } = JolocomLib.KeyTypes
    this.identityWallet = await this.registry.authenticate(userVault, {
      encryptionPass: pass,
      derivationPath: jolocomIdentityKey,
    })
  }
}

