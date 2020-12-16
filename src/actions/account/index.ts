import { groupBy, map, mergeRight, omit, uniq, zipWith } from 'ramda'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { IdentitySummary, CredentialMetadataSummary } from '@jolocom/sdk'

import { navigationActions } from 'src/actions/'

import { routeList } from 'src/routeList'
import { CategorizedClaims, DecoratedClaims } from 'src/reducers/account'
import {
  getClaimMetadataByCredentialType,
  getCredentialUiCategory,
  getUiCredentialTypeByType,
} from 'src/lib/util'
import { ThunkAction } from 'src/store'
import { compose } from 'redux'
import { Not } from 'typeorm'
import { HAS_EXTERNAL_CREDENTIALS } from './actionTypes'
import { SDKError } from '@jolocom/sdk'
import { checkTermsOfService } from '../generic'
import { checkRecoverySetup } from '../notifications/checkRecoverySetup'

export const setDid = (did: string) => ({
  type: 'DID_SET',
  value: did,
})

export const setSelected = (claim: DecoratedClaims) => ({
  type: 'SET_SELECTED',
  selected: claim,
})

export const resetSelected = () => ({
  type: 'RESET_SELECTED',
})

export const handleClaimInput = (fieldValue: string, fieldName: string) => ({
  type: 'HANDLE_CLAIM_INPUT',
  fieldName,
  fieldValue,
})

export const checkIdentityExists: ThunkAction = async (
  dispatch,
  getState,
  agent,
) => {
  try {
    const identityWallet = await agent.loadIdentity()
    const userDid = identityWallet.identity.did
    dispatch(setDid(userDid))
    await dispatch(setClaimsForDid)
    await dispatch(checkRecoverySetup)
    return dispatch(checkTermsOfService(routeList.Home))
  } catch (err) {
    if (
      err.message === SDKError.codes.NoEntropy ||
      err.message === SDKError.codes.NoWallet
    ) {
      // No seed in database, user must register
      // But check if a registration was already in progress
      const isRegistering = getState().registration.loading.isRegistering

      const routeName = isRegistering
        ? routeList.RegistrationProgress
        : routeList.Landing

      return dispatch(navigationActions.navigate({ routeName }))
    }

    throw err
  }
}

export const openClaimDetails = (
  claim: DecoratedClaims,
): ThunkAction => dispatch => {
  dispatch(setSelected(claim))
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.ClaimDetails,
    }),
  )
}

export const saveClaim: ThunkAction = async (
  dispatch,
  getState,
  agent,
) => {
  const { identityWallet, storage, passwordStore } = agent

  const did = getState().account.did.did
  const claimsItem = getState().account.claims.selected
  const password = await passwordStore.getPassword()

  const verifiableCredential = await identityWallet.create.signedCredential(
    {
      metadata: getClaimMetadataByCredentialType(claimsItem.credentialType),
      // the library acts directly on the object passed in, so a copy should be made first
      claim: { ...claimsItem.claimData },
      subject: did,
    },
    password,
  )

  if (claimsItem.id) {
    await storage.delete.verifiableCredential(claimsItem.id)
  }

  await storage.store.verifiableCredential(verifiableCredential)

  await dispatch(setClaimsForDid)

  return dispatch(navigationActions.navigatorResetHome())
}

export const hasExternalCredentials: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { storage, identityWallet } = backendMiddleware
  // TODO FIXME
  // we only need a count, no need to actually load and deserialize
  // all of them
  const externalCredentials = await storage.get.verifiableCredential({
    issuer: Not(identityWallet.did),
  })

  return dispatch({
    type: HAS_EXTERNAL_CREDENTIALS,
    value: externalCredentials.length !== 0,
  })
}
export const setClaimsForDid: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { storage } = backendMiddleware

  const verifiableCredentials: SignedCredential[] = await storage.get.verifiableCredential()

  const metadata = await Promise.all(
    verifiableCredentials.map(el => storage.get.credentialMetadata(el)),
  )

  const issuers = uniq(verifiableCredentials.map(cred => cred.issuer))

  const issuerMetadata = await Promise.all(
    issuers.map(storage.get.publicProfile),
  )

  const claims = prepareClaimsForState(
    verifiableCredentials,
    metadata,
    issuerMetadata,
  ) as CategorizedClaims

  return dispatch({
    type: 'SET_CLAIMS_FOR_DID',
    claims,
  })
}

export const prepareClaimsForState = (
  credentials: SignedCredential[],
  credentialMetadata: Array<CredentialMetadataSummary | {}>,
  issuerMetadata: IdentitySummary[],
) =>
  compose(
    groupBy(getCredentialUiCategory),
    zipWith(mergeRight, credentialMetadata),
    map(addIssuerInfo(issuerMetadata)),
    map(convertToDecoratedClaim),
  )(credentials)

export const addIssuerInfo = (issuerProfiles: IdentitySummary[]) => (
  claim: DecoratedClaims,
) => {
  if (!issuerProfiles || !issuerProfiles.length) {
    return claim
  }

  const issuer = issuerProfiles.find(el => el.did === claim.issuer.did)

  return issuer
    ? {
        ...claim,
        issuer,
      }
    : claim
}

/** @TODO Util, make subject mandatory (in lib) */
export const convertToDecoratedClaim = ({
  claim,
  type,
  issuer: issuerDid,
  id,
  expires,
}: SignedCredential): DecoratedClaims => ({
  credentialType: getUiCredentialTypeByType(type),
  issuer: {
    did: issuerDid,
  },
  claimData: omit(['id'], claim),
  id,
  subject: claim.id || 'Not found',
  expires: expires || undefined,
})
