import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { ThunkAction } from '../../store'
import { InteractionChannel } from 'src/lib/interactionManager/types'
import { cancelSSO } from '.'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
import { IGenericAttrs } from 'jolocom-lib/js/interactionTokens/interactionTokens.types'

export const consumeGenericRequest = (
  genericRequest: JSONWebToken<Generic>,
  channel: InteractionChannel
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { interactionManager } = backendMiddleware
  const interaction = await interactionManager.start(
    channel,
    genericRequest
  )

  const { state, issuer } = interaction.getSummary()
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.GenericConsent,
      params: {
        interactionId: interaction.id,
        interactionSummary: {
          state: {
            //@ts-ignore
            description: JSON.stringify(state.body),
          },
          issuer
        }
      },
      key: 'genericRequest',
    }),
  )
}

// TODO The body is currently not passed
export const sendGenericResponse = <T> (
  body: IGenericAttrs<T>,
  interactionId: string
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const interaction = backendMiddleware.interactionManager.getInteraction(interactionId)
  return interaction.send(await interaction.createGenericResponse(body)).then(() => dispatch(cancelSSO))
}
