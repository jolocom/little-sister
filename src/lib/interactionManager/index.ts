import { JSONWebToken, JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { protocols } from './protocols'
import { IInteractionManager } from './types'

class InteractionManager implements IInteractionManager {
    private interaction: Array<JSONWebToken<JWTEncodable>>
    private protocol: AsyncGenerator<undefined, void, any>

    constructor(initialMessage: JSONWebToken<JWTEncodable>) {
        this.interaction = []
        this.interaction.push(initialMessage)
        this.protocol = protocols[initialMessage.interactionType]

        this.protocol.next(initialMessage)
    }

    public tokenRecieved(token: JSONWebToken<JWTEncodable>) {
        this.protocol.next(token)
    }

    public getConsent(consent: boolean) {
        this.protocol.next(consent)
    }

}
