import { ConnectionOptions } from 'typeorm'

const typeOrmConf: ConnectionOptions = {
  type: 'sqlite',
  database: 'LocalSmartWalletData',
  logging: ['error', 'query', 'schema'],
  synchronize: false,
  migrationsRun: true,
  migrations: ['src/lib/storage/migrations/*.ts'],
  entities: ['src/lib/storage/entities/*.ts'],
  cli: {
    migrationsDir: 'src/lib/storage/migration',
  },
}

module.exports = typeOrmConf
