import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { AppError, ErrorCode } from '../../lib/errors'
import { showErrorScreen } from '../generic'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { receiveExternalCredential, setDeepLinkLoading } from './index'
import { accountActions } from '../index'
import { isNil, all, map, compose, isEmpty } from 'ramda'
import { httpAgent } from '../../lib/http'
import { JolocomLib } from 'jolocom-lib'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import { ThunkAction } from '../../store'
import { CredentialMetadataSummary } from '../../lib/storage/storage'
import {keyIdToDid} from 'jolocom-lib/js/utils/helper'

export const consumeCredentialOfferRequest = (
  credOfferRequest: JSONWebToken<CredentialOfferRequest>,
): ThunkAction => async (
  dispatch,
  getState,
  { keyChainLib, identityWallet, registry },
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

    const selectedMetadata = interactionToken.offeredTypes.map<
      CredentialMetadataSummary
    >(type => ({
        issuer: keyIdToDid(credOfferRequest.issuer),
        type,
        renderInfo: interactionToken.getRenderInfoForType(type) || {},
        metadata: interactionToken.getMetadataForType(type) || {}
    }))

    const credOfferResponse = await identityWallet.create.interactionTokens.response.offer(
      { callbackURL, selectedCredentials },
      password,
      credOfferRequest,
    )

    const res = await httpAgent.postRequest<{ token: string }>(
      callbackURL,
      { 'Content-Type': 'application/json' },
      { token: credOfferResponse.encode() },
    )

    const credentialReceive = JolocomLib.parse.interactionToken.fromJWT<
      CredentialsReceive
    >(res.token)

    return dispatch(
      receiveExternalCredential(credentialReceive, selectedMetadata),
    )
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
