import { JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { Interaction } from './interaction'
import { Flow } from './flow'
import { DecryptionFlowState } from './types'
import { isDecryptionRequest, isDecryptionResponse } from './guards'
import { CallType, DecryptionRequest, DecryptionResponse } from './rpc'

export class DecryptionFlow extends Flow {
  public state: DecryptionFlowState = {
    req: { rpc: CallType.AsymDecrypt, request: '' },
  }

  public constructor(ctx: Interaction) {
    super(ctx)
  }

  public handleInteractionToken(
    token: JWTEncodable,
    interactionType: InteractionType,
  ) {
    switch (interactionType) {
      case InteractionType.Generic:
        if (isDecryptionRequest(token))
          return this.consumeDecryptionRequest(token)
        else if (isDecryptionResponse(token))
          return this.consumeDecryptionResponse(token)
      default:
        throw new Error('Interaction type not found')
    }
  }

  public async consumeDecryptionRequest(token: DecryptionRequest) {
    if (!this.state.req.request) this.state.req.request = token.body.request

    return true
  }

  public async consumeDecryptionResponse(token: DecryptionResponse) {
    return true
  }
}
