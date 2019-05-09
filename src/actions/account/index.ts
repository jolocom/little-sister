import { AnyAction, Dispatch } from 'redux'
import { genericActions, navigationActions } from 'src/actions/'
import { BackendMiddleware } from 'src/backendMiddleware'
import { routeList } from 'src/routeList'
import { DecoratedClaims, CategorizedClaims } from 'src/reducers/account'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {
  getClaimMetadataByCredentialType,
  getCredentialUiCategory,
  getUiCredentialTypeByType,
  instantiateIdentityWallet,
} from '../../lib/util'
import { cancelReceiving } from '../sso'

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
  type: 'HANLDE_CLAIM_INPUT',
  fieldName,
  fieldValue,
})

export const toggleClaimsLoading = (value: boolean) => ({
  type: 'TOGGLE_CLAIMS_LOADING',
  value,
})

export const checkIdentityExists = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  const { storageLib } = backendMiddleware

  try {
    const personas = await storageLib.get.persona()
    if (!personas.length) {
      dispatch(toggleLoading(false))
      return
    }

    dispatch(setDid(personas[0].did))
    await instantiateIdentityWallet(backendMiddleware)

    dispatch(toggleLoading(false))
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
  } catch (err) {
    if (err.message.indexOf('no such table') === 0) {
      return
    }
    dispatch(genericActions.showErrorScreen(err))
  }
}

export const setIdentityWallet = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  try {
    await instantiateIdentityWallet(backendMiddleware)
  } catch (err) {
    dispatch(genericActions.showErrorScreen(err))
  }
}

export const openClaimDetails = (claim: DecoratedClaims) => (
  dispatch: Dispatch<AnyAction>,
) => {
  dispatch(setSelected(claim))
  dispatch(
    navigationActions.navigate({
      routeName: routeList.ClaimDetails,
    }),
  )
}

export const saveClaim = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  const { identityWallet, storageLib, keyChainLib } = backendMiddleware

  try {
    const did = getState().account.did.get('did')
    const claimsItem = getState().account.claims.toJS().selected
    const password = await keyChainLib.getPassword()

    const verifiableCredential = await identityWallet.create.signedCredential(
      {
        metadata: getClaimMetadataByCredentialType(claimsItem.credentialType),
        claim: claimsItem.claimData,
        subject: did,
      },
      password,
    )

    if (claimsItem.id) {
      await storageLib.delete.verifiableCredential(claimsItem.id)
    }

    await storageLib.store.verifiableCredential(verifiableCredential)
    await setClaimsForDid()

    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.Home,
      }),
    )
  } catch (err) {
    dispatch(genericActions.showErrorScreen(err))
  }
}

// TODO Currently only rendering  / adding one
export const saveExternalCredentials = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  const { storageLib } = backendMiddleware
  const externalCredentials = getState().account.claims.toJS().pendingExternal
  const cred: SignedCredential = externalCredentials[0]

  if (cred.id) {
    await storageLib.delete.verifiableCredential(cred.id)
  }

  try {
    await storageLib.store.verifiableCredential(externalCredentials[0])
    dispatch(cancelReceiving())
  } catch (err) {
    dispatch(genericActions.showErrorScreen(err))
  }
}

export const toggleLoading = (value: boolean) => ({
  type: 'SET_LOADING',
  value,
})

export const setClaimsForDid = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  dispatch(toggleClaimsLoading(true))
  const storageLib = backendMiddleware.storageLib

  const verifiableCredentials: SignedCredential[] = await storageLib.get.verifiableCredential()
  const claims = prepareClaimsForState(
    verifiableCredentials,
  ) as CategorizedClaims

  dispatch({
    type: 'SET_CLAIMS_FOR_DID',
    claims,
  })

  dispatch(toggleClaimsLoading(false))
}

const prepareClaimsForState = (credentials: SignedCredential[]) => {
  const categorizedClaims = {}
  const decoratedCredentials = convertToDecoratedClaim(credentials)

  decoratedCredentials.forEach(decoratedCred => {
    const uiCategory = getCredentialUiCategory(decoratedCred.credentialType)

    try {
      categorizedClaims[uiCategory].push(decoratedCred)
    } catch (err) {
      categorizedClaims[uiCategory] = [decoratedCred]
    }
  })

  return categorizedClaims
}

// TODO Util, make subject mandatory
export const convertToDecoratedClaim = (
  vCreds: SignedCredential[],
): DecoratedClaims[] =>
  vCreds.map(vCred => {
    const claimData = { ...vCred.claim }
    delete claimData.id

    return {
      credentialType: getUiCredentialTypeByType(vCred.type),
      claimData,
      id: vCred.id,
      issuer: vCred.issuer,
      subject: vCred.claim.id || 'Not found',
      expires: vCred.expires || undefined,
    }
  })
