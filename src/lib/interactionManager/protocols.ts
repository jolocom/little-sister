
import { JSONWebToken, JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'

type TokenAction = (token: JSONWebToken<JWTEncodable>) => Promise<void>


interface InternalProtocolApi {
    send: TokenAction
    store: TokenAction
    validate: TokenAction
}

async function* credentialShare(api: InternalProtocolApi) {
    const request = yield

    await api.validate(request)

    api.store(request)

    const consent = yield

    if (!consent) return
    
    const response = yield

    api.store(response)

    api.send(response)
}

async function* credentialOffer(api: InternalProtocolApi) {
    const offer = yield

    await api.validate(offer)

    api.store(offer)

    const selection = yield

    if (!selection) return

    const response = yield

    api.store(response)

    api.send(response)

    const reciept = yield

    api.store(reciept)
}

const authentication = credentialShare

export const protocols = {
    [InteractionType.CredentialRequest]: credentialShare,
    [InteractionType.CredentialOfferRequest]: credentialOffer,
    [InteractionType.Authentication]: authentication
}
