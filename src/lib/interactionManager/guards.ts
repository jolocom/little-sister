import { JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { CredentialOfferResponse } from 'jolocom-lib/js/interactionTokens/credentialOfferResponse'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import {
  EncryptionRequest,
  EncryptionResponse,
  DecryptionRequest,
  DecryptionResponse,
  CallType,
  Call,
  Result,
} from './rpc'

export const isCredentialRequest = (
  token: JWTEncodable,
): token is CredentialRequest =>
  !!(token as CredentialRequest).requestedCredentialTypes

export const isCredentialResponse = (
  token: JWTEncodable,
): token is CredentialResponse => {
  return !!(token as CredentialResponse).suppliedCredentials
}

export const isAuthenticationRequest = (
  token: JWTEncodable,
): token is Authentication => {
  return !!(token as Authentication).description
}

export const isCredentialOfferRequest = (
  token: JWTEncodable,
): token is CredentialOfferRequest =>
  !!(token as CredentialOfferRequest).offeredCredentials

export const isCredentialOfferResponse = (
  token: JWTEncodable,
): token is CredentialOfferResponse =>
  !!(token as CredentialOfferResponse).selectedCredentials

export const isCredentialReceive = (
  token: JWTEncodable,
): token is CredentialsReceive =>
  !!(token as CredentialsReceive).signedCredentials

export const isEncryptionRequest = (
  token: JWTEncodable,
): token is EncryptionRequest => {
  return (
    isGeneric<Call<string>>(token) &&
    token.body.rpc === CallType.AsymEncrypt &&
    typeof token.body.request === 'string'
  )
}
export const isEncryptionResponse = (
  token: JWTEncodable,
): token is EncryptionResponse => {
  return (
    isGeneric<Result<string>>(token) &&
    token.body.rpc === CallType.AsymEncrypt &&
    typeof token.body.result === 'string'
  )
}
export const isDecryptionRequest = (
  token: JWTEncodable,
): token is DecryptionRequest => {
  return (
    isGeneric<Call<string>>(token) &&
    token.body.rpc === CallType.AsymDecrypt &&
    typeof token.body.request === 'string'
  )
}
export const isDecryptionResponse = (
  token: JWTEncodable,
): token is DecryptionResponse => {
  return (
    isGeneric<Result<string>>(token) &&
    token.body.rpc === CallType.AsymDecrypt &&
    typeof token.body.result === 'string'
  )
}

export const isGeneric = <T>(token: JWTEncodable): token is Generic<T> =>
  !!(token as Generic<T>).body
