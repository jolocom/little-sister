import { JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { Interaction } from './interaction'
import { Flow } from './flow'
import { EncryptionFlowState } from './types'
import { isEncryptionRequest, isEncryptionResponse } from './guards'
import { CallType, EncryptionRequest, EncryptionResponse } from './rpc'

export class EncryptionFlow extends Flow {
  public state: EncryptionFlowState = {
    req: { rpc: CallType.AsymEncrypt, request: '' },
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
        if (isEncryptionRequest(token))
          return this.consumeEncryptionRequest(token)
        else if (isEncryptionResponse(token))
          return this.consumeEncryptionResponse(token)
      default:
        throw new Error('Interaction type not found')
    }
  }

  public async consumeEncryptionRequest(token: EncryptionRequest) {
    if (!this.state.req.request) this.state.req.request = token.body.request

    return true
  }

  public async consumeEncryptionResponse(token: EncryptionResponse) {
    return true
  }
}
