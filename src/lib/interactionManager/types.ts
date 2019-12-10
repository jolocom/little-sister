
import { JSONWebToken, JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'


/* Responsabilities:
 * 1. continue an interaction
 */
export interface IInteractionManager {
    tokenRecieved: (token: JSONWebToken<JWTEncodable>) => void

}
