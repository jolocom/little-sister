import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import {
  consumeCredentialRequest,
  receiveExternalCredential,
} from '../../actions/sso'
import { consumeAuthenticationRequest } from '../../actions/sso/authenticationRequest'
import { consumeCredentialOfferRequest } from '../../actions/sso/credentialOfferRequest'
import { consumePaymentRequest } from '../../actions/sso/paymentRequest'
import {AsyncThunkAction} from '../../store'

/**
 * @param Metadata should not need to be passed to credential receive because it comes from cred Offer
 * Furthermore, this only needs to be defined for requests
 */

type InteractionTokenHandler<T extends JWTEncodable, R = void> = (
  token: JSONWebToken<T>,
) => AsyncThunkAction<R>

const buildHandler = <T extends JWTEncodable>(
  handler: InteractionTokenHandler<T>,
  expectedTokenType?: InteractionType,
) => (interactionToken: JSONWebToken<T>): AsyncThunkAction => {
  if (
    expectedTokenType &&
    expectedTokenType !== interactionToken.interactionType
  )
    throw new Error('Incorrect interaction token handler')

  return handler(interactionToken)
}

const authReqHandler = buildHandler(
  consumeAuthenticationRequest,
  InteractionType.Authentication,
)
const credentialOfferHandler = buildHandler(
  consumeCredentialOfferRequest,
  InteractionType.CredentialOfferRequest,
)
const credentialRequestHandler = buildHandler(
  consumeCredentialRequest,
  InteractionType.CredentialRequest,
)
const credentialReceiveHandler = buildHandler(
  receiveExternalCredential,
  InteractionType.CredentialsReceive,
)
const paymentRequestHandler = buildHandler(
  consumePaymentRequest,
  InteractionType.PaymentRequest,
)

export const interactionHandlers = {
  [InteractionType.Authentication]: authReqHandler,
  [InteractionType.CredentialRequest]: credentialRequestHandler,
  [InteractionType.CredentialOfferRequest]: credentialOfferHandler,
  [InteractionType.CredentialsReceive]: credentialReceiveHandler,
  [InteractionType.PaymentRequest]: paymentRequestHandler,
} as { [key in InteractionType]: InteractionTokenHandler<JWTEncodable> }
