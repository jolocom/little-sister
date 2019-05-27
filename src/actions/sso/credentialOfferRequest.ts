import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { AppError, ErrorCode } from '../../lib/errors'
import { showErrorScreen } from '../generic'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { parseJWT, setDeepLinkLoading } from './index'
import { accountActions } from '../index'
import { BackendMiddleware } from '../../backendMiddleware'
import { isNil, all, map, compose, isEmpty } from 'ramda'
import { httpAgent } from '../../lib/http'
import { Dispatch, AnyAction } from 'redux'

export const consumeCredentialOfferRequest = (
  credOfferRequest: JSONWebToken<CredentialOfferRequest>,
) => async (
  dispatch: Dispatch<AnyAction>,
  getState: Function,
  { keyChainLib, identityWallet, registry }: BackendMiddleware,
) => {
  try {
    await identityWallet.validateJWT(credOfferRequest, undefined, registry)
    const { interactionToken } = credOfferRequest
    const { callbackURL } = interactionToken

    if (!areRequirementsEmpty(interactionToken)) {
      throw new Error('Input requests are not yet supported on the wallet')
    }

    const password = await keyChainLib.getPassword()
    const selectedCredentials = interactionToken.offeredTypes.map(type => ({
      type,
    }))

    const credOfferResponse = await identityWallet.create.interactionTokens.response.offer(
      { callbackURL, selectedCredentials },
      password,
      credOfferRequest,
    )

    const res = await httpAgent.postRequest<{ token: string }>(
      callbackURL,
      { 'Content-Type': 'application/json' },
      {token: credOfferResponse.encode()}
    )
    console.log('Cred Offer response:', res)
    console.log('Cred Offer response:', res.token)

    dispatch(parseJWT(res.token))
  } catch (err) {
    dispatch(accountActions.toggleLoading(false))
    dispatch(setDeepLinkLoading(false))
    dispatch(
      showErrorScreen(new AppError(ErrorCode.CredentialOfferFailed, err)),
    )
  }
}

const areRequirementsEmpty = (interactionToken: CredentialOfferRequest) =>
  compose(
    all(isNil || isEmpty),
    map(interactionToken.getRequestedInputForType.bind(interactionToken)),
  )(interactionToken.offeredTypes)
