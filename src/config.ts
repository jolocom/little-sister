import { ConnectionOptions } from 'typeorm'
import { entityList } from './lib/storage/entities'

const typeOrmConf: ConnectionOptions = {
  type: 'react-native',
  database: 'LocalSmartWalletData',
  location: 'default',
  logging: ['error', 'query', 'schema'],
  synchronize: true,
  entities: entityList,
}

export default {
  fuelingEndpoint: 'https://faucet.jolocom.com/request',
  typeOrmConfig: typeOrmConf,
}
