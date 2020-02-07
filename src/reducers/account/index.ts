import { combineReducers } from 'redux'
import { did } from 'src/reducers/account/did'
import { claims } from 'src/reducers/account/claims'
import {
  CredentialOfferMetadata,
  CredentialOfferRenderInfo,
} from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { IdentitySummary } from '../../actions/sso/types'

export interface DecoratedClaims {
  credentialType: string
  claimData: {
    [key: string]: any /** @TODO Type correctly */
  }
  id: string
  issuer: IdentitySummary
  subject: string
  expires?: Date
  renderInfo?: CredentialOfferRenderInfo
  metadata?: CredentialOfferMetadata
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad'
}

export interface CategorizedClaims {
  readonly [key: string]: DecoratedClaims[]
}

export interface ClaimsState {
  readonly selected: DecoratedClaims
  readonly decoratedCredentials: CategorizedClaims
  readonly pendingExternal: {
    offeror: IdentitySummary
    offer: Array<{
      credential: SignedCredential
      decoratedClaim: DecoratedClaims
    }>
  }
  readonly hasExternalCredentials: boolean
}

export interface DidState {
  readonly did: string
}

// TODO avoid state.account.did.did access patterns
export interface AccountState {
  did: DidState
  claims: ClaimsState
}

export const accountReducer = combineReducers({
  did,
  claims,
})
