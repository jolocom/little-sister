import React from 'react'
import { connect } from 'react-redux'
import { ssoActions } from 'src/actions'
import { ThunkDispatch } from 'src/store'
import {
  withErrorScreen,
  withLoading,
  withInternet,
} from 'src/actions/modifiers'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { InteractionSummary } from '@jolocom/sdk/js/interactionManager/types'
import { EstablishChannelConsentComponent } from '../components/establishChannelConsentComponent'

interface EstablishChannelNavigationParams {
  interactionId: string
  interactionSummary: InteractionSummary
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<
    NavigationState,
    EstablishChannelNavigationParams
  >
}

export const EstablishChannelConsentContainer = (props: Props) => {
  const {
    confirmEstablishChannelRequest,
    cancelEstablishChannelRequest,
    navigation: {
      state: {
        params: { interactionId, interactionSummary },
      },
    },
  } = props
  return (
    <EstablishChannelConsentComponent
      interactionSummary={interactionSummary}
      confirmEstablishChannelRequest={() =>
        confirmEstablishChannelRequest(interactionId)
      }
      cancelEstablishChannelRequest={cancelEstablishChannelRequest}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  confirmEstablishChannelRequest: (interactionId: string) =>
    dispatch(
      withInternet(
        withLoading(withErrorScreen(ssoActions.startChannel(interactionId))),
      ),
    ),
  cancelEstablishChannelRequest: () => dispatch(ssoActions.cancelSSO),
})

export const EstablishChannelConsent = connect(
  null,
  mapDispatchToProps,
)(EstablishChannelConsentContainer)
