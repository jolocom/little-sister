import * as Keychain from 'react-native-keychain'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { groupBy, map, mergeRight, omit, uniq, zipWith } from 'ramda'

import { PIN_SERVICE } from 'src/ui/deviceauth/utils/keychainConsts'
import { navigationActions, genericActions } from 'src/actions/'

import { routeList } from 'src/routeList'
import { CategorizedClaims, DecoratedClaims } from 'src/reducers/account'
import {
  getClaimMetadataByCredentialType,
  getCredentialUiCategory,
  getUiCredentialTypeByType,
} from '@jolocom/sdk/js/src/lib/util'
import { ThunkAction } from 'src/store'
import { compose } from 'redux'
import { IdentitySummary } from '../sso/types'
import { Not } from 'typeorm'
import { HAS_EXTERNAL_CREDENTIALS } from './actionTypes'
import { BackendError } from '@jolocom/sdk/js/src/lib/errors/types'
import { checkTermsOfService } from '../generic'
import { CredentialMetadataSummary } from '@jolocom/sdk/js/src/lib/storage'
import { checkRecoverySetup } from '../notifications/checkRecoverySetup'

export const setDid = (did: string) => ({
  type: 'DID_SET',
  value: did,
})

export const setLocalAuth = () => ({
  type: 'SET_LOCAL_AUTH',
})

export const openLocalAuth = () => ({
  type: 'OPEN_LOCAL_AUTH',
})

export const closeLocalAuth = () => ({
  type: 'CLOSE_LOCAL_AUTH',
})

export const setSelected = (claim: DecoratedClaims) => ({
  type: 'SET_SELECTED',
  selected: claim,
})

export const setPopup = (value: boolean) => ({
  type: 'SET_POPUP',
  payload: value,
})

export const lockApp = () => ({
  type: 'LOCK_APP',
})

export const unlockApp = () => ({
  type: 'UNLOCK_APP',
})

export const closeLock = () => ({
  type: 'CLOSE_LOCK',
})

export const openLock = () => ({
  type: 'OPEN_LOCK',
})

export const closePINinstructions = () => ({
  type: 'CLOSE_PIN_INSTRICTIONS',
})

export const openPINinstructions = () => ({
  type: 'OPEN_PIN_INSTRICTIONS',
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
  backendMiddleware,
) => {
  try {
    const identityWallet = await backendMiddleware.prepareIdentityWallet()
    const userDid = identityWallet.identity.did
    dispatch(setDid(userDid))
    await dispatch(setClaimsForDid)
    //await dispatch(checkLocalDeviceAuthSet)
    await dispatch(checkRecoverySetup)
    return dispatch(
      checkTermsOfService(() => dispatch(genericActions.lockApp())),
    )
  } catch (err) {
    if (
      err.message === BackendError.codes.NoEntropy ||
      err.message === BackendError.codes.NoWallet
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

export const checkLocalDeviceAuthSet: ThunkAction = async dispatch => {
  const pin = await Keychain.getGenericPassword({
    service: PIN_SERVICE,
  })
  if (pin) {
    dispatch(setLocalAuth())
  } else {
    dispatch(openLocalAuth())
  }
}

export const handleRecoveryBack: ThunkAction = async (dispatch, getState) => {
  console.log(getState())
  const state = getState()
  if (state.account.did.did) {
    dispatch(openPINinstructions())
    dispatch(navigationActions.navigate({ routeName: routeList.Home }))
  } else {
    dispatch(navigationActions.navigate({ routeName: routeList.Landing }))
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
  backendMiddleware,
) => {
  const { identityWallet, storageLib, keyChainLib } = backendMiddleware

  const did = getState().account.did.did
  const claimsItem = getState().account.claims.selected
  const password = await keyChainLib.getPassword()

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
    await storageLib.delete.verifiableCredential(claimsItem.id)
  }

  await storageLib.store.verifiableCredential(verifiableCredential)

  await dispatch(setClaimsForDid)

  return dispatch(navigationActions.navigatorResetHome())
}

export const hasExternalCredentials: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { storageLib, identityWallet } = backendMiddleware
  // TODO FIXME
  // we only need a count, no need to actually load and deserialize
  // all of them
  const externalCredentials = await storageLib.get.verifiableCredential({
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
  const { storageLib } = backendMiddleware

  const verifiableCredentials: SignedCredential[] = await storageLib.get.verifiableCredential()

  const metadata = await Promise.all(
    verifiableCredentials.map(el => storageLib.get.credentialMetadata(el)),
  )

  const issuers = uniq(verifiableCredentials.map(cred => cred.issuer))

  const issuerMetadata = await Promise.all(
    issuers.map(storageLib.get.publicProfile),
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
