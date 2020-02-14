import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { navigationActions } from 'src/actions'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { routeList } from 'src/routeList'
import { cancelSSO } from '.'
import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import { ThunkAction } from '../../store'
import { AppError } from '../../lib/errors'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import ErrorCode from '../../lib/errorCodes'
import { generateIdentitySummary } from './utils'
import { AuthenticationRequestSummary } from './types'

export const consumeAuthenticationRequest = (
  authenticationRequest: JSONWebToken<Authentication>,
  isDeepLinkInteraction: boolean = false,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { identityWallet, registry } = backendMiddleware
  await identityWallet.validateJWT(authenticationRequest)
  const requester = await registry.resolve(
    keyIdToDid(authenticationRequest.issuer),
  )

  const requesterSummary = generateIdentitySummary(requester)

  const authenticationDetails: AuthenticationRequestSummary = {
    requester: requesterSummary,
    callbackURL: authenticationRequest.interactionToken.callbackURL,
    description: authenticationRequest.interactionToken.description,
    requestJWT: authenticationRequest.encode(),
  }
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.AuthenticationConsent,
      params: { isDeepLinkInteraction, authenticationDetails },
      key: 'authenticationRequest',
    }),
  )
}

export const sendAuthenticationResponse = (
  isDeepLinkInteraction: boolean,
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
    true
  )

  if (isDeepLinkInteraction) {
    const callback = `${callbackURL}/${response.encode()}`
    if (!(await Linking.canOpenURL(callback))) {
      throw new AppError(ErrorCode.DeepLinkUrlNotFound)
    }
    return Linking.openURL(callback).then(() => dispatch(cancelSSO))
  }

  await fetch(callbackURL, {
    method: 'POST',
    body: JSON.stringify({ token: response.encode() }),
    headers: { 'Content-Type': 'application/json' },
  })

  return dispatch(cancelSSO)
}
