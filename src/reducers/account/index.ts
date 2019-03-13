import { combineReducers } from 'redux'
import { did } from 'src/reducers/account/did'
import { claims } from 'src/reducers/account/claims'
import { loading } from 'src/reducers/account/loading'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { ClaimEntry } from 'jolocom-lib/js/credentials/credential/types'

export interface DecoratedClaims {
  credentialType: string
  claimData: ClaimEntry
  id: string
  issuer: string
  subject: string
  expires?: Date
}

export interface CategorizedClaims {
  readonly [key: string]: DecoratedClaims[]
}

export interface ClaimsState {
  readonly loading: boolean
  readonly selected: DecoratedClaims
  readonly decoratedCredentials: CategorizedClaims
  readonly pendingExternal: SignedCredential[]
}

export interface DidState {
  readonly did: string
}

export interface LoadingState {
  readonly loading: boolean
}

// TODO avoid state.account.did.did access patterns
export interface AccountState {
  did: DidState
  claims: ClaimsState
  loading: LoadingState
}

export const accountReducer = combineReducers({
  did,
  claims,
  loading,
})
