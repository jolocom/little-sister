import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { ThunkAction } from '../../store'
import { Interaction, FlowType } from '@jolocom/sdk'
import { cancelSSO, scheduleSuccessNotification } from '.'
import { scheduleNotification } from '../notifications'
import { createInfoNotification, createWarningNotification } from '../../lib/notifications'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'
import { Channel } from '@jolocom/sdk/js/channels'

export const consumeEstablishChannelRequest = (
  interaction: Interaction,
): ThunkAction => async (dispatch, getState, sdk) => {
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

export const handleChannelInterxn = (channel: Channel, interxn: Interaction): ThunkAction => async (
  dispatch,
  getState,
  sdk,
) => {
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

  let resp
  try {
    switch (interxn.flow.type) {
      case FlowType.Resolution:
        resp = await interxn.createResolutionResponse()
        break
      case FlowType.Encrypt:
        resp = await interxn.createEncResponseToken()
        successNotification(strings.YOUR_DATA_WAS_ENCRYPTED)
        break
      case FlowType.Decrypt:
        resp = await interxn.createDecResponseToken()
        successNotification(strings.YOUR_DATA_WAS_DECRYPTED)
        break
    }

    if (resp) {
      await channel.send(resp)
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
  } catch (err) {
    const notification = createWarningNotification({
      title: I18n.t(strings.AWKWARD),
      message: I18n.t(strings.IT_SEEMS_LIKE_WE_CANT_DO_THIS)
    })

    dispatch(scheduleNotification(notification))
    // const error = err instanceof AppError
    //   ? err
    //   : new AppError(ErrorCode.Unknown, err)
    // dispatch(showErrorScreen(error))
  }
}

export const startChannel = (interactionId: string): ThunkAction => async (
  dispatch,
  getState,
  sdk,
) => {
  const interaction = await sdk.interactionManager.getInteraction(interactionId)

  const establishResp = await interaction.createEstablishChannelResponse(0)
  await interaction.processInteractionToken(establishResp)
  const channel = await sdk.channels.create(interaction)

  await channel.start(async interxn => {
    await dispatch(handleChannelInterxn(channel, interxn))
  })
  await channel.send(establishResp)

  dispatch(cancelSSO)
  dispatch(scheduleSuccessNotification)
}
