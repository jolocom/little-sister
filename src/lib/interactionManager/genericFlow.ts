import { JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { Interaction } from './interaction'
import { Flow } from './flow'
import { isGeneric } from './guards'

export class GenericFlow<T> extends Flow {
  public state: { body?: T } = {}

  public constructor(ctx: Interaction) {
    super(ctx)
  }

  // TODO InteractionType.AuthenticaitonResponse should exist
  public handleInteractionToken(
    token: JWTEncodable,
    interactionType: InteractionType,
  ): Promise<boolean> {
    switch (interactionType) {
      case InteractionType.Generic:
        if (isGeneric(token))
          return this.consumeGenericRequest(token as Generic<T>) // TODO reasses
      default:
        throw new Error('Interaction type not found')
    }
  }

  public async consumeGenericRequest(token: Generic<T>) {
    this.state.body = token.body
    return true
  }
}
