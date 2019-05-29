import {
  SettingEntity,
  CredentialEntity,
  MasterKeyEntity,
  PersonaEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
} from '.'

export { SettingEntity } from './settingEntity'
export { CredentialEntity } from './credentialEntity'
export { MasterKeyEntity } from './masterKeyEntity'
export { PersonaEntity } from './personaEntity'
export { SignatureEntity } from './signatureEntity'
export { VerifiableCredentialEntity } from './verifiableCredentialEntity'
export { CacheEntity } from './cacheEntity'

export const entityList = [
  SettingEntity,
  CredentialEntity,
  MasterKeyEntity,
  PersonaEntity,
  SignatureEntity,
  VerifiableCredentialEntity,
  CacheEntity,
]
