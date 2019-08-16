import { JolocomLib } from 'jolocom-lib'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { EncryptionLib, EncryptionLibInterface } from 'src/lib/crypto'
import { Storage } from 'src/lib/storage/storage'
import { KeyChain, KeyChainInterface } from 'src/lib/keychain'
import { ConnectionOptions } from 'typeorm'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { IRegistry } from 'jolocom-lib/js/registries/types'
import { createJolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry'
import { IpfsCustomConnector } from './lib/ipfs'
import { jolocomContractsAdapter } from 'jolocom-lib/js/contracts/contractsAdapter'
import { jolocomEthereumResolver } from 'jolocom-lib/js/ethereum/ethereum'
import { jolocomContractsGateway } from 'jolocom-lib/js/contracts/contractsGateway'

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
