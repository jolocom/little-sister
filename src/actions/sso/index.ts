import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import {
  StateCredentialRequestSummary,
  StateVerificationSummary,
} from 'src/reducers/sso'
import { navigationActions, accountActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { showErrorScreen } from 'src/actions/generic'
import { getUiCredentialTypeByType } from 'src/lib/util'
import { resetSelected } from '../account'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { AppError, ErrorCode } from 'src/lib/errors'
import { ThunkAction } from '../../store'
import { CredentialMetadataSummary } from '../../lib/storage/storage'
import { equals } from 'ramda'

export const setCredentialRequest = (
  request: StateCredentialRequestSummary,
) => ({
  type: 'SET_CREDENTIAL_REQUEST',
  value: request,
})

export const clearInteractionRequest = () => ({
  type: 'CLEAR_INTERACTION_REQUEST',
})

export const setReceivingCredential = (external: SignedCredential[]) => ({
  type: 'SET_EXTERNAL',
  external,
})

export const setDeepLinkLoading = (value: boolean) => ({
  type: 'SET_DEEP_LINK_LOADING',
  value,
})

export const receiveExternalCredential = (
  credReceive: JSONWebToken<CredentialsReceive>,
  credentialOfferMetadata?: Array<CredentialMetadataSummary>,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { identityWallet, registry, storageLib } = backendMiddleware

  try {
    await identityWallet.validateJWT(credReceive, undefined, registry)
    const providedCredentials = credReceive.interactionToken.signedCredentials

    const validationResults = await JolocomLib.util.validateDigestables(
      providedCredentials,
    )

    // TODO Error Code
    if (validationResults.some(equals(false))) {
      throw new Error('Invalid credentials received')
    }

    if (credentialOfferMetadata && credentialOfferMetadata.length) {
      await Promise.all(
        credentialOfferMetadata.map(storageLib.store.credentialMetadata),
      )
    }

    dispatch(setReceivingCredential(providedCredentials))
    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.CredentialDialog,
      }),
    )
  } catch (error) {
    dispatch(
      showErrorScreen(new AppError(ErrorCode.CredentialsReceiveFailed, error)),
    )
  } finally {
    dispatch(accountActions.toggleLoading(false))
  }
}

interface AttributeSummary {
  type: string[]
  results: Array<{
    verification: string
    fieldName: string
    values: string[]
  }>
}

export const consumeCredentialRequest = (
  decodedCredentialRequest: JSONWebToken<CredentialRequest>,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { storageLib, identityWallet, registry } = backendMiddleware
  const { did } = getState().account.did

  try {
    await identityWallet.validateJWT(
      decodedCredentialRequest,
      undefined,
      registry,
    )
    const requestedTypes =
      decodedCredentialRequest.interactionToken.requestedCredentialTypes
    const attributesForType = await Promise.all<AttributeSummary>(
      requestedTypes.map(storageLib.get.attributesByType),
    )

    const populatedWithCredentials = await Promise.all(
      attributesForType.map(async entry => {
        if (entry.results.length) {
          return Promise.all(
            entry.results.map(async result => ({
              type: getUiCredentialTypeByType(entry.type),
              values: result.values,
              verifications: await storageLib.get.verifiableCredential({
                id: result.verification,
              }),
            })),
          )
        }

        return [
          {
            type: getUiCredentialTypeByType(entry.type),
            values: [],
            verifications: [],
          },
        ]
      }),
    )

    const abbreviated = populatedWithCredentials.map(attribute =>
      attribute.map(entry => ({
        ...entry,
        verifications: entry.verifications.map((vCred: SignedCredential) => ({
          id: vCred.id,
          issuer: vCred.issuer,
          selfSigned: vCred.signer.did === did,
          expires: vCred.expires,
        })),
      })),
    )
    const flattened = abbreviated.reduce((acc, val) => acc.concat(val))

    // TODO requester shouldn't be optional
    const summary = {
      callbackURL: decodedCredentialRequest.interactionToken.callbackURL,
      requester: decodedCredentialRequest.issuer,
      availableCredentials: flattened,
      requestJWT: decodedCredentialRequest.encode(),
    }

    dispatch(setCredentialRequest(summary))
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Consent }))
    dispatch(setDeepLinkLoading(false))
  } catch (error) {
    dispatch(
      showErrorScreen(new AppError(ErrorCode.CredentialRequestFailed, error)),
    )
  } finally {
    dispatch(accountActions.toggleLoading(false))
  }
}

export const sendCredentialResponse = (
  selectedCredentials: StateVerificationSummary[],
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { storageLib, keyChainLib, identityWallet } = backendMiddleware
  const {
    activeCredentialRequest: { callbackURL, requestJWT },
    isDeepLinkInteraction,
  } = getState().sso

  try {
    const password = await keyChainLib.getPassword()

    const credentials = await Promise.all(
      selectedCredentials.map(
        async cred =>
          (await storageLib.get.verifiableCredential({ id: cred.id }))[0],
      ),
    )

    const jsonCredentials = credentials.map(cred => cred.toJSON())

    const request = JolocomLib.parse.interactionToken.fromJWT(requestJWT)
    const response = await identityWallet.create.interactionTokens.response.share(
      {
        callbackURL,
        suppliedCredentials: jsonCredentials,
      },
      password,
      request,
    )

    if (isDeepLinkInteraction) {
      return Linking.openURL(`${callbackURL}/${response.encode()}`).then(() =>
        dispatch(cancelSSO()),
      )
    } else {
      return fetch(callbackURL, {
        method: 'POST',
        body: JSON.stringify({ token: response.encode() }),
        headers: { 'Content-Type': 'application/json' },
      }).then(() => dispatch(cancelSSO()))
    }
  } catch (error) {
    dispatch(clearInteractionRequest())
    dispatch(accountActions.toggleLoading(false))
    dispatch(
      showErrorScreen(new AppError(ErrorCode.CredentialResponseFailed, error)),
    )
  }
}

export const cancelSSO = (): ThunkAction => dispatch => {
  dispatch(clearInteractionRequest())
  dispatch(accountActions.toggleLoading(false))
  dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
}

export const cancelReceiving = (): ThunkAction => dispatch => {
  dispatch(resetSelected())
  return dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
}

export const toggleDeepLinkFlag = (value: boolean) => ({
  type: 'SET_DEEP_LINK_FLAG',
  value,
})
