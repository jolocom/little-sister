import { Interaction } from '@jolocom/sdk'

import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { ThunkAction } from '../../store'
import { cancelSSO, scheduleSuccessNotification } from '.'

export const consumeAuthenticationRequest = (
  interaction: Interaction,
): ThunkAction => async (dispatch, getState, agent) => {
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.AuthenticationConsent,
      params: {
        interactionId: interaction.id,
        interactionSummary: interaction.getSummary(),
      },
      key: 'authenticationRequest',
    }),
  )
}

export const sendAuthenticationResponse = (
  interactionId: string,
): ThunkAction => async (dispatch, getState, sdk) => {
  const interaction = await sdk.interactionManager.getInteraction(
    interactionId,
  )
  const resp = await interaction.createAuthenticationResponse()
  await interaction.send(resp)
  await interaction.processInteractionToken(resp)
  await dispatch(cancelSSO)
  return dispatch(scheduleSuccessNotification)
}
