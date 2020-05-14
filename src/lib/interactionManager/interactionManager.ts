import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Interaction } from './interaction'
import { BackendMiddleware } from '../../backendMiddleware'
import { InteractionChannel } from './types'

/***
 * - initiated inside BackendMiddleware
 * - has access to identityWallet / registry ?? (or should be inside Interaction)
 * - holds a map of all interactions:
 *    - {nonce: token or interaction instance} ??
 * - can start / end an interaction
 *
 */

export class InteractionManager {
  public interactions: {
    [NONCE: string]: Interaction
  }  = {}

  public readonly backendMiddleware: BackendMiddleware

  public constructor(backendMiddleware: BackendMiddleware) {
    this.backendMiddleware = backendMiddleware
  }

  public async start(
    channel: InteractionChannel,
    token: JSONWebToken<JWTEncodable>,
  ) {
    const interaction = new Interaction(
      this.backendMiddleware, // TODO Lift
      channel,
      token.nonce,
      token.interactionType
    )

    console.log(JSON.stringify(token))
    this.interactions[token.nonce] = interaction
    await interaction.processInteractionToken(token)

    return interaction
  }

  public getInteraction(id: string) {
    return this.interactions[id]
  }
}
