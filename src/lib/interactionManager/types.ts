import { CredentialOffer } from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { IdentitySummary } from '../../actions/sso/types'
import { FlowState } from './flow'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { CredentialResponse } from 'jolocom-lib/js/interactionTokens/credentialResponse'
import { AsymEncryptCall, AsymDecryptCall } from './rpc'

// TODO define and refactor how the UI components/containers handle the InteractionSummary.
export interface InteractionSummary {
  issuer: IdentitySummary
  state: FlowState
}

export enum InteractionChannel {
  QR = 'QR',
  Deeplink = 'Deeplink',
  HTTP = 'HTTP',
  Bluetooth = 'Bluetooth',
  NFC = 'NFC',
}

export interface AuthenticationFlowState extends FlowState {
  description: string
}

export interface CredentialRequestFlowState extends FlowState {
  availableCredentials: CredentialTypeSummary[]
}

export interface CredentialOfferFlowState extends FlowState {
  offerSummary: Array<
    SignedCredentialWithMetadata & { validationErrors: ValidationErrorMap }
  >
}

export interface DecryptionFlowState extends FlowState {
  req: AsymDecryptCall
}

export interface CredentialTypeSummary {
  type: string
  values: string[]
  verifications: CredentialVerificationSummary[]
}

export interface CredentialVerificationSummary {
  id: string
  issuer: IdentitySummary
  selfSigned: boolean
  expires: string | undefined | Date
}

export interface AttributeSummary {
  type: string[]
  results: Array<{
    verification: string
    fieldName: string
    values: string[]
  }>
}

type ValidationErrorMap = {
  invalidIssuer?: boolean
  invalidSubject?: boolean
  invalidSignature?: boolean
}

export interface SignedCredentialWithMetadata extends CredentialOffer {
  signedCredential?: SignedCredential
}
