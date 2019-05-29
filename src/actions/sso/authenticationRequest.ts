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
import { ThunkAction } from '../../store'

export const setAuthenticationRequest = (
  request: StateAuthenticationRequestSummary,
) => ({
  type: 'SET_AUTHENTICATION_REQUEST',
  value: request,
})

export const consumeAuthenticationRequest = (
  authenticationRequest: JSONWebToken<Authentication>,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
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
    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.AuthenticationConsent,
      }),
    )
  } catch (err) {
    dispatch(
      showErrorScreen(new AppError(ErrorCode.AuthenticationRequestFailed, err)),
    )
  } finally {
    dispatch(ssoActions.setDeepLinkLoading(false))
  }
}

export const sendAuthenticationResponse = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
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
        dispatch(cancelSSO()),
      )
    } else {
      return fetch(callbackURL, {
        method: 'POST',
        body: JSON.stringify({ token: response.encode() }),
        headers: { 'Content-Type': 'application/json' },
      }).then(() => dispatch(cancelSSO()))
    }
  } catch (err) {
    dispatch(clearInteractionRequest())
    dispatch(
      showErrorScreen(
        new AppError(ErrorCode.AuthenticationResponseFailed, err),
      ),
    )
  }
}
