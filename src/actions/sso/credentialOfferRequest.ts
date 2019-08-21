import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { AppError, ErrorCode } from '../../lib/errors'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { receiveExternalCredential } from './index'
import {
  all,
  compose,
  isEmpty,
  isNil,
  map,
  mergeRight,
  omit,
  either,
} from 'ramda'
import { httpAgent } from '../../lib/http'
import { JolocomLib } from 'jolocom-lib'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import { ThunkAction } from 'src/store'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import { withLoading, withErrorScreen } from '../modifiers'
import { getMethodPrefixFromDid } from 'jolocom-lib/js/utils/crypto'
import { DidDocument } from 'jolocom-lib/js/identity/didDocument/didDocument'
import { Identity } from 'jolocom-lib/js/identity/identity'
import RNFetchBlob from 'rn-fetch-blob'

export const consumeCredentialOfferRequest = (
  credOfferRequest: JSONWebToken<CredentialOfferRequest>,
  isDeepLinkInteraction: boolean = false,
): ThunkAction => async (
  dispatch,
  getState,
  { keyChainLib, identityWallet, registry, resolver },
) => {
  await identityWallet.validateJWT(credOfferRequest, undefined, resolver)
  const { interactionToken } = credOfferRequest
  const { callbackURL } = interactionToken

  if (!areRequirementsEmpty(interactionToken)) {
    throw new Error('Input requests are not yet supported on the wallet')
  }

  // TODO
  const resolveFn =
    getMethodPrefixFromDid(keyIdToDid(credOfferRequest.issuer)) === 'jolo'
      ? (did: string) => registry.resolve(did)
      : (did: string) =>
          resolver.resolve(did).then(didDoc =>
            Identity.fromDidDocument({
              didDocument: DidDocument.fromJSON(didDoc),
            }),
          )

  const { did: offerorDid, publicProfile } = await resolveFn(
    keyIdToDid(credOfferRequest.issuer),
  )

  const parsedProfile = publicProfile
    ? omit(['id', 'did'], publicProfile.toJSON().claim)
    : {}

  const offerorInfo = mergeRight(
    { did: offerorDid },
    { publicProfile: parsedProfile },
  )
  const selectedCredentialTypes = interactionToken.offeredTypes.map(type => ({
    type,
  }))

  const selectedMetadata = interactionToken.offeredTypes.map(type => ({
    issuer: {
      did: keyIdToDid(credOfferRequest.issuer),
    },
    type,
    renderInfo: interactionToken.getRenderInfoForType(type) || {},
    metadata: interactionToken.getMetadataForType(type) || {},
  }))

  const password = await keyChainLib.getPassword()

  const credOfferResponse = await identityWallet.create.interactionTokens.response.offer(
    { callbackURL, selectedCredentials: selectedCredentialTypes },
    password,
    credOfferRequest,
  )

  const res = await RNFetchBlob.config({
    trusty: true,
  })
    .fetch(
      'POST',
      callbackURL,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ token: credOfferResponse.encode() }),
    )
    .then(res => res.json())

  const credentialReceive = JolocomLib.parse.interactionToken.fromJWT<
    CredentialsReceive
  >(res.token)

  return dispatch(
    withLoading(
      withErrorScreen(
        receiveExternalCredential(
          credentialReceive,
          offerorInfo,
          isDeepLinkInteraction,
          selectedMetadata,
        ),
        err => new AppError(ErrorCode.CredentialsReceiveFailed, err),
      ),
    ),
  )
}

const areRequirementsEmpty = (interactionToken: CredentialOfferRequest) =>
  compose(
    all(either(isNil, isEmpty)),
    map(interactionToken.getRequestedInputForType.bind(interactionToken)),
  )(interactionToken.offeredTypes)
