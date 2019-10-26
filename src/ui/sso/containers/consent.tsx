import React from 'react'
import { connect } from 'react-redux'
import { ConsentComponent } from 'src/ui/sso/components/consent'
import { ssoActions } from 'src/actions'
import { ThunkDispatch } from 'src/store'
import { withLoading, withErrorScreen } from 'src/actions/modifiers'
import {
  CredentialRequestSummary,
  CredentialVerificationSummary,
} from '../../../actions/sso/types'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { withConsentSummary } from '../../generic/consentWithSummaryHOC'
import { SendResponse } from 'src/lib/transportLayers';

interface CredentialRequestNavigationParams {
  send: SendResponse
  jwt: string
}

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {
  navigation: NavigationScreenProp<
    NavigationState,
    CredentialRequestNavigationParams
  >
  interactionDetails: CredentialRequestSummary
}

const ConsentContainer = (props: Props) => {
  const {
    interactionDetails,
    currentDid,
    sendCredentialResponse,
    cancelSSO,
    navigation: {
      state: {
        params: { send },
      },
    },
  } = props

  const handleSubmitClaims = (credentials: CredentialVerificationSummary[]) => {
    sendCredentialResponse(
      send,
      credentials,
      interactionDetails,
    )
  }

  const { availableCredentials, requester, callbackURL } = interactionDetails
  return (
    <ConsentComponent
      requester={requester}
      callbackURL={callbackURL}
      did={currentDid}
      availableCredentials={availableCredentials}
      handleSubmitClaims={handleSubmitClaims}
      handleDenySubmit={cancelSSO}
    />
  )
}

const mapStateToProps = (state: any) => ({
  currentDid: state.account.did.did,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  sendCredentialResponse: (
    send: SendResponse,
    credentials: CredentialVerificationSummary[],
    credentialRequestDetails: CredentialRequestSummary,
  ) =>
    dispatch(
      withLoading(
        withErrorScreen(
          ssoActions.sendCredentialResponse(
            send,
            credentials,
            credentialRequestDetails
          ),
        ),
      ),
    ),
  cancelSSO: () => dispatch(ssoActions.cancelSSO),
})

export const Consent = withConsentSummary(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ConsentContainer),
)
