import typeOrmConf from '../ormconfig'
import { ConnectionOptions } from 'typeorm/browser'

export default {
  fuelingEndpoint: 'https://faucet.jolocom.com/request',
  typeOrmConfig: typeOrmConf as ConnectionOptions,
}

export const sentryDSN =
  'https://e8485535c30e4a38932e718ef04fd784@sentry.jolocom.io/2'
