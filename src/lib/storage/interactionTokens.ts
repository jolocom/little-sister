import {JSONWebToken} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import {InteractionType} from 'jolocom-lib/js/interactionTokens/types'
import {consumeCredentialRequest, receiveExternalCredential} from '../../actions/sso'
import {consumeAuthenticationRequest} from '../../actions/sso/authenticationRequest'
import {consumeCredentialOfferRequest} from '../../actions/sso/credentialOfferRequest'
import {Authentication} from 'jolocom-lib/js/interactionTokens/authentication'
import {CredentialOfferRequest} from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import {CredentialRequest} from 'jolocom-lib/js/interactionTokens/credentialRequest'
import {CredentialsReceive} from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import {PaymentRequest} from 'jolocom-lib/js/interactionTokens/paymentRequest'
import {consumePaymentRequest} from '../../actions/sso/paymentRequest'
/**
 * @param Metadata should not need to be passed to credential receive because it comes from cred Offer
 * Furthermore, this only needs to be defined for requests
 */

export const interactionHandlers = {
  [InteractionType.Authentication]: <T extends JSONWebToken<Authentication>> (interactionToken: T) => consumeAuthenticationRequest(interactionToken),
  [InteractionType.CredentialRequest]: <T extends JSONWebToken<CredentialRequest>>(interactionToken: T)  => consumeCredentialRequest(interactionToken),
  [InteractionType.CredentialOfferRequest]: <T extends JSONWebToken<CredentialOfferRequest>> (interactionToken: T) => consumeCredentialOfferRequest(interactionToken),
  [InteractionType.CredentialsReceive]: <T extends JSONWebToken<CredentialsReceive>> (interactionToken: T) => receiveExternalCredential(interactionToken),
  [InteractionType.PaymentRequest]: <T extends JSONWebToken<PaymentRequest>> (interactionToken: T) => consumePaymentRequest(interactionToken)
}
