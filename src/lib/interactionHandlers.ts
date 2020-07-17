import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { PaymentRequest } from 'jolocom-lib/js/interactionTokens/paymentRequest'
import {
  InteractionTransportType,
  EstablishChannelType,
  EstablishChannelRequest,
} from '@jolocom/sdk/js/src/lib/interactionManager/types'
import { ssoActions } from 'src/actions'
import { ThunkAction } from 'src/store'
import { JolocomSDK } from 'react-native-jolocom'
import { navigatorResetHome } from 'src/actions/navigation'

/**
 * @param Metadata should not need to be passed to credential receive because it comes from cred Offer
 * Furthermore, this only needs to be defined for requests
 */

export const interactionHandlers = {
  [InteractionType.Authentication]: <T extends JSONWebToken<Authentication>>(
    interactionToken: T,
    channel: InteractionTransportType,
    //@ts-ignore
  ) => ssoActions.consumeAuthenticationRequest(interactionToken, channel),
  [InteractionType.CredentialRequest]: <
    T extends JSONWebToken<CredentialRequest>
  >(
    interactionToken: T,
    channel: InteractionTransportType,
  ) => ssoActions.consumeCredentialRequest(interactionToken, channel),
  [InteractionType.CredentialOfferRequest]: <
    T extends JSONWebToken<CredentialOfferRequest>
  >(
    interactionToken: T,
    channel: InteractionTransportType,
  ) => ssoActions.consumeCredentialOfferRequest(interactionToken, channel),
  [InteractionType.PaymentRequest]: <T extends JSONWebToken<PaymentRequest>>(
    interactionToken: T,
    isDeepLinkInteraction: boolean,
  ) =>
    ssoActions.consumePaymentRequest(interactionToken, isDeepLinkInteraction),

  [EstablishChannelType.EstablishChannelRequest]: <T extends JSONWebToken<EstablishChannelRequest>>(
    interactionToken: T,
    isDeepLinkInteraction: boolean,
  ): ThunkAction => async (
    dispatch,
    getState,
    sdk: JolocomSDK
  ) => {
    const interxn = await sdk.interactionManager.start<EstablishChannelRequest>(InteractionTransportType.HTTP, interactionToken)

    // TODO: get user consent first
    const resp = await interxn.createEstablishChannelResponse(0)
    await interxn.processInteractionToken(resp)
    const ch = await sdk.channels.create(interxn)
    ch.start()

    return dispatch(navigatorResetHome())
  }
}
