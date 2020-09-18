import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { ThunkAction } from '../../store'

import { ResolutionRequest } from '@jolocom/sdk/js/src/lib/interactionManager/resolutionFlow'
import { InteractionTransportType } from '@jolocom/sdk/js/src/lib/interactionManager/types'
import { scheduleSuccessNotification, cancelSSO } from '.'

export const consumeResolutionRequest = (
  resolutionRequest: JSONWebToken<ResolutionRequest>,
  channel: InteractionTransportType,
): ThunkAction => async (dispatch, getState, sdk) => {
  const interxn = await sdk.interactionManager.start(channel, resolutionRequest)
  const resp = await interxn.createResolutionResponse()

  return interxn
    .send(resp)
    .then(() => dispatch(cancelSSO))
    .then(() => dispatch(scheduleSuccessNotification))
}
