import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Dispatch, AnyAction } from 'redux'
import { BackendMiddleware } from 'src/backendMiddleware'
import { navigationActions } from 'src/actions'
import { showErrorScreen } from 'src/actions/generic'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { StateAuthenticationRequestSummary } from 'src/reducers/sso'
import { routeList } from 'src/routeList'
import { cancelSSO } from '.'
import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'

export const setAuthenticationRequest = (
  request: StateAuthenticationRequestSummary,
) => ({
  type: 'SET_AUTHENTICATION_REQUEST',
  value: request,
})

export const consumeAuthenticationRequest = (
  authenticationRequest: JSONWebToken<Authentication>,
) => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  const { identityWallet, registry } = backendMiddleware
  try {
    await identityWallet.validateJWT(authenticationRequest, undefined, registry)
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
    dispatch(showErrorScreen(err))
  }
}

export const sendAuthenticationResponse = () => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  backendMiddleware: BackendMiddleware,
) => {
  const { identityWallet } = backendMiddleware
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

    if (callbackURL.includes('http')) {
      await fetch(callbackURL, {
        method: 'POST',
        body: JSON.stringify({ token: response.encode() }),
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      const url = callbackURL + response.encode()
      Linking.openURL(url)
    }
    dispatch(cancelSSO())
  } catch (err) {
    console.log(err)
    dispatch(showErrorScreen(new Error('Sending payment response failed.')))
  }
}
