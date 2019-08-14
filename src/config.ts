import { ConnectionOptions } from 'typeorm/browser'
import { entityList } from './lib/storage/entities'

const typeOrmConf: ConnectionOptions = {
  type: 'react-native',
  database: 'LocalSmartWalletData',
  location: 'default',
  logging: ['error', 'query', 'schema'],
  synchronize: true,
  entities: entityList,
}

const env = process.env['NODE_ENV'] || 'development'
const isDev = env === 'development'
const isTest = env === 'test'

export const skipEntropyCollection = isDev || isTest
export const skipIdentityRegisteration = isDev || isTest

export default {
  fuelingEndpoint: 'https://faucet.jolocom.com/request',
  typeOrmConfig: typeOrmConf,
}
