import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'

export enum CallType {
  AsymEncrypt = 'asymEncrypt',
  AsymDecrypt = 'asymDecrypt',
}

export type Call<T> = {
  rpc: CallType
  request: T
}

export type Result<T> = {
  rpc: CallType
  result: T
}

export type AsymDecryptCall = Call<string> & {
  rpc: CallType.AsymDecrypt
}

export type AsymDecryptResult = Result<string> & {
  rpc: CallType.AsymDecrypt
}

export type AsymEncryptCall = Call<string> & {
  rpc: CallType.AsymEncrypt
}

export type AsymEncryptResult = Result<string> & {
  rpc: CallType.AsymEncrypt
}

export type DecryptionRequest = Generic<AsymDecryptCall>
export type DecryptionResponse = Generic<AsymDecryptResult>
export type EncryptionRequest = Generic<AsymEncryptCall>
export type EncryptionResponse = Generic<AsymEncryptResult>
