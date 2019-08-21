import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { EncryptionLib, EncryptionLibInterface } from 'src/lib/crypto'
import { Storage } from 'src/lib/storage/storage'
import { KeyChain, KeyChainInterface } from 'src/lib/keychain'
import { ConnectionOptions } from 'typeorm/browser'
import { createJolocomRegistry, JolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry'
import { IpfsCustomConnector } from './lib/ipfs'
import { ContractsAdapter } from 'jolocom-lib/js/contracts/contractsAdapter'
import { jolocomEthereumResolver } from 'jolocom-lib/js/ethereum/ethereum'
import {
  createJolocomResolver,
  createValidatingResolver,
  MultiResolver,
  validatingJolocomResolver,
} from 'jolocom-lib/js/resolver'
import {
  getStaxConfiguredContractsConnector, getStaxConfiguredContractsGateway,
  getStaxConfiguredStorageConnector,
} from 'jolocom-lib-stax-connector'
import { noValidation } from 'jolocom-lib/js/validation/validation'
import { httpAgent } from './lib/http'
import { publicKeyToDID, sha256 } from 'jolocom-lib/js/utils/crypto'

export const staxEndpoint = ''
const staxContractAddress = ''
const staxChainId = 0

export class BackendMiddleware {
  public identityWallet!: IdentityWallet
  public storageLib: Storage
  public encryptionLib: EncryptionLibInterface
  public keyChainLib: KeyChainInterface
  public registry: JolocomRegistry
  public resolver: MultiResolver

  /**
   * TODO:
   *  - Anchroing on Jolocom (using jolocom resolver)
   *  - Pass custom multi-resolver
   *  - Payments / contracts are configured for staX
   *  - Request ether for payments part of this perhaps
   */

  public constructor(config: {
    fuelingEndpoint: string
    typeOrmConfig: ConnectionOptions
  }) {
    this.storageLib = new Storage(config.typeOrmConfig)
    this.encryptionLib = new EncryptionLib()
    this.keyChainLib = new KeyChain()

    const staxEthConnector = getStaxConfiguredContractsConnector(
      staxEndpoint,
      staxContractAddress,
      httpAgent,
    )
    const staxIpfsConnector = getStaxConfiguredStorageConnector(
      staxEndpoint,
      httpAgent,
    )

    publicKeyToDID('stax')(sha256)

    this.resolver = new MultiResolver({
      jolo: validatingJolocomResolver,
      stax: createValidatingResolver(
        createJolocomResolver(staxEthConnector, staxIpfsConnector),
        noValidation,
      ),
    })

    this.registry = createJolocomRegistry({
      ipfsConnector: new IpfsCustomConnector({
        host: 'ipfs.jolocom.com',
        port: 443,
        protocol: 'https',
      }),
      ethereumConnector: jolocomEthereumResolver,
      contracts: {
        adapter: new ContractsAdapter(staxChainId),
        gateway: getStaxConfiguredContractsGateway(
          staxEndpoint,
          staxChainId,
          httpAgent,
        ),
      },
      didResolver: validatingJolocomResolver,
    })
  }

  public async initStorage(): Promise<void> {
    await this.storageLib.initConnection()
  }
}
