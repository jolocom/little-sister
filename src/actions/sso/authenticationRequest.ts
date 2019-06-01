import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { navigationActions, ssoActions } from 'src/actions'
import { showErrorScreen } from 'src/actions/generic'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { StateAuthenticationRequestSummary } from 'src/reducers/sso'
import { routeList } from 'src/routeList'
import { cancelSSO, clearInteractionRequest } from '.'
import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import { AppError, ErrorCode } from 'src/lib/errors'
import { ThunkDispatch } from '../../store'
import { RootState } from '../../reducers'
import { BackendMiddleware } from '../../backendMiddleware'
import {AnyAction} from 'redux'

export const setAuthenticationRequest = (
  request: StateAuthenticationRequestSummary,
) : AnyAction => ({
  type: 'SET_AUTHENTICATION_REQUEST',
  value: request,
})

export const consumeAuthenticationRequest = (
  authenticationRequest: JSONWebToken<Authentication>,
) => async (
  dispatch: ThunkDispatch,
  getState: () => RootState,
  backendMiddleware: BackendMiddleware,
) => {
  const { identityWallet } = backendMiddleware
  try {
    await identityWallet.validateJWT(authenticationRequest)
    const authenticationDetails: StateAuthenticationRequestSummary = {
      requester: authenticationRequest.issuer,
      callbackURL: authenticationRequest.interactionToken.callbackURL,
      description: authenticationRequest.interactionToken.description,
      requestJWT: authenticationRequest.encode(),
    }
    dispatch(setAuthenticationRequest(authenticationDetails))
    return dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.AuthenticationConsent,
      }),
    )
  } catch (err) {
    return dispatch(
      showErrorScreen(new AppError(ErrorCode.AuthenticationRequestFailed, err)),
    )
  } finally {
    return dispatch(ssoActions.setDeepLinkLoading(false))
  }
}

export const sendAuthenticationResponse = async (
  dispatch: ThunkDispatch,
  getState: () => RootState,
  backendMiddleware: BackendMiddleware,
) => {
  const { identityWallet } = backendMiddleware
  const { isDeepLinkInteraction } = getState().sso

  const {
    callbackURL,
    requestJWT,
    description,
  } = getState().sso.activeAuthenticationRequest
  try {
    const password = await backendMiddleware.keyChainLib.getPassword()
    const decodedAuthRequest = JolocomLib.parse.interactionToken.fromJWT<
      Authentication
    >(requestJWT)

    const response = await identityWallet.create.interactionTokens.response.auth(
      { callbackURL, description },
      password,
      decodedAuthRequest,
    )

    if (isDeepLinkInteraction) {
      return Linking.openURL(`${callbackURL}/${response.encode()}`).then(() =>
        dispatch(cancelSSO),
      )
    }
    await fetch(callbackURL, {
      method: 'POST',
      body: JSON.stringify({ token: response.encode() }),
      headers: { 'Content-Type': 'application/json' },
    })

    return dispatch(cancelSSO)
  } catch (err) {
    dispatch(clearInteractionRequest)
    return dispatch(
      showErrorScreen(
        new AppError(ErrorCode.AuthenticationResponseFailed, err),
      ),
    )
  }
}
