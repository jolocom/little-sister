import React from 'react'
import { connect } from 'react-redux'
import { AuthenticationConsentComponent } from '../components/authenticationConsent'
import { ssoActions } from 'src/actions'
import { ThunkDispatch } from 'src/store'
import {
  withErrorScreen,
  withLoading,
  withInternet,
} from 'src/actions/modifiers'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { InteractionSummary } from '@jolocom/sdk/js/interactionManager/types'

interface AuthenticationNavigationParams {
  interactionId: string
  interactionSummary: InteractionSummary
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<
    NavigationState,
    AuthenticationNavigationParams
  >
}

export const AuthenticationConsentContainer = (props: Props) => {
  const {
    confirmAuthenticationRequest,
    cancelAuthenticationRequest,
    navigation: {
      state: {
        params: { interactionId, interactionSummary },
      },
    },
  } = props
  return (
    <AuthenticationConsentComponent
      interactionSummary={interactionSummary}
      confirmAuthenticationRequest={() =>
        confirmAuthenticationRequest(interactionId)
      }
      cancelAuthenticationRequest={cancelAuthenticationRequest}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  confirmAuthenticationRequest: (interactionId: string) =>
    dispatch(
      withInternet(
        withLoading(
          withErrorScreen(ssoActions.sendAuthenticationResponse(interactionId)),
        ),
      ),
    ),
  cancelAuthenticationRequest: () => dispatch(ssoActions.cancelSSO),
})

export const AuthenticationConsent = connect(
  null,
  mapDispatchToProps,
)(AuthenticationConsentContainer)
