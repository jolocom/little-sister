import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { PaymentRequest } from 'jolocom-lib/js/interactionTokens/paymentRequest'
import { InteractionChannel } from '../interactionManager/types'
import { ssoActions } from 'src/actions'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
/**
 * @param Metadata should not need to be passed to credential receive because it comes from cred Offer
 * Furthermore, this only needs to be defined for requests
 */

export const interactionHandlers = {
  [InteractionType.Authentication]: <T extends JSONWebToken<Authentication>>(
    interactionToken: T,
    channel: InteractionChannel,
    //@ts-ignore
  ) => ssoActions.consumeAuthenticationRequest(interactionToken, channel),
  [InteractionType.CredentialRequest]: <
    T extends JSONWebToken<CredentialRequest>
  >(
    interactionToken: T,
    channel: InteractionChannel,
  ) => ssoActions.consumeCredentialRequest(interactionToken, channel),
  [InteractionType.CredentialOfferRequest]: <
    T extends JSONWebToken<CredentialOfferRequest>
  >(
    interactionToken: T,
    channel: InteractionChannel,
  ) => ssoActions.consumeCredentialOfferRequest(interactionToken, channel),
  [InteractionType.PaymentRequest]: <T extends JSONWebToken<PaymentRequest>>(
    interactionToken: T,
    isDeepLinkInteraction: boolean,
  ) =>
    ssoActions.consumePaymentRequest(interactionToken, isDeepLinkInteraction),
    [InteractionType.Generic]: <T extends JSONWebToken<Generic>>(
      interactionToken: T,
      channel: InteractionChannel
    ) => ssoActions.consumeGenericRequest(interactionToken, channel)
}
