import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { cancelSSO } from '.'
import { JolocomLib } from 'jolocom-lib'
import { ThunkAction } from '../../store'
import { AuthenticationRequestSummary, IdentitySummary } from './types'
import { SendResponse } from 'src/lib/transportLayers';

export const formatAuthenticationRequest = (
  authenticationRequest: JSONWebToken<Authentication>,
  requester: IdentitySummary,
): AuthenticationRequestSummary => ({
  requester,
  callbackURL: authenticationRequest.interactionToken.callbackURL,
  description: authenticationRequest.interactionToken.description,
  requestJWT: authenticationRequest.encode(),
})

export const sendAuthenticationResponse = (
  send: SendResponse,
  authenticationDetails: AuthenticationRequestSummary,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { identityWallet } = backendMiddleware

  const { callbackURL, requestJWT, description } = authenticationDetails
  const password = await backendMiddleware.keyChainLib.getPassword()
  const decodedAuthRequest = JolocomLib.parse.interactionToken.fromJWT<
    Authentication
  >(requestJWT)

  const response = await identityWallet.create.interactionTokens.response.auth(
    { callbackURL, description },
    password,
    decodedAuthRequest,
  )

  await send(callbackURL, response)

  return dispatch(cancelSSO)
}
