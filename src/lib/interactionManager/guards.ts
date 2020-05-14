import { JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { CredentialOfferResponse } from 'jolocom-lib/js/interactionTokens/credentialOfferResponse'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'

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

export const isGenericRequest = (
  token: JWTEncodable,
): token is Generic =>
  !!(token as Generic).body

