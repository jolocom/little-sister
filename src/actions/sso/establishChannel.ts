import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { ThunkAction } from '../../store'
import {
  InteractionTransportType,
  EstablishChannelRequest,
  FlowType,
} from '@jolocom/sdk/js/src/lib/interactionManager/types'
import { cancelSSO, scheduleSuccessNotification } from '.'
import { scheduleNotification } from '../notifications'
import { createInfoNotification } from '../../lib/notifications'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'

export const consumeEstablishChannelRequest = (
  establishChannelRequest: JSONWebToken<EstablishChannelRequest>,
  channel: InteractionTransportType,
): ThunkAction => async (dispatch, getState, sdk) => {
  const { interactionManager } = sdk
  const interaction = await interactionManager.start<EstablishChannelRequest>(
    InteractionTransportType.HTTP,
    establishChannelRequest,
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.EstablishChannelConsent,
      params: {
        interactionId: interaction.id,
        interactionSummary: interaction.getSummary(),
      },
      key: 'establishChannelConsent',
    }),
  )
}

export const startChannel = (interactionId: string): ThunkAction => async (
  dispatch,
  getState,
  sdk,
) => {
  const interaction = sdk.interactionManager.getInteraction(interactionId)

  const response = await interaction.createEstablishChannelResponse(0)
  await interaction.processInteractionToken(response)
  const channel = await sdk.channels.create(interaction)

  const successNotification = (message: string) => {
    dispatch(
      scheduleNotification(
        createInfoNotification({
          title: I18n.t(strings.ACTION_SUCCEEDED),
          message: I18n.t(message),
        }),
      ),
    )
  }

  channel.send(response.encode())
  channel.start(async interxn => {
    let resp
    switch (interxn.flow.type) {
      case FlowType.Resolution:
        resp = await interxn.createResolutionResponse()
        break
      case FlowType.Encrypt:
        resp = await interxn.createEncResponseToken()
        // Action Succeeded!
        // your data was encrypted
        successNotification(strings.YOUR_DATA_WAS_ENCRYPTED)
        break
      case FlowType.Decrypt:
        // Action succeeded!
        // the data was decrypted
        resp = await interxn.createDecResponseToken()
        successNotification(strings.YOUR_DATA_WAS_DECRYPTED)
        break
    }

    if (resp) {
      channel.send(resp.encode())
    } else {
      console.warn(
        'received illegal interxn request on channel',
        channel.id,
        interxn.flow.type,
      )
      dispatch(
        scheduleNotification(
          createInfoNotification({
            title: I18n.t(strings.AWKWARD),
            message: I18n.t(strings.SOMETHING_DOESNT_SEEM_RIGHT),
          }),
        ),
      )
    }
  })

  dispatch(cancelSSO)
  dispatch(scheduleSuccessNotification)
}
