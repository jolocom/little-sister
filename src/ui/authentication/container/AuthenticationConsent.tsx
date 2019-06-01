import React from 'react'
import { connect } from 'react-redux'
import { AuthenticationConsentComponent } from '../components/AuthenticationConsent'
import { StateAuthenticationRequestSummary } from 'src/reducers/sso'
import { RootState } from 'src/reducers'
import { cancelSSO } from 'src/actions/sso'
import { sendAuthenticationResponse } from 'src/actions/sso/authenticationRequest'
import {ThunkDispatch} from '../../../store'

interface ConnectProps {}

interface Props extends ConnectProps {
  activeAuthenticationRequest: StateAuthenticationRequestSummary
  confirmAuthenticationRequest: () => typeof sendAuthenticationResponse
  cancelAuthenticationRequest: () => typeof cancelSSO
}

interface State {}

export class AuthenticationConsentContainer extends React.Component<
  Props,
  State
> {
  render() {
    return (
      <AuthenticationConsentComponent
        activeAuthenticationRequest={this.props.activeAuthenticationRequest}
        confirmAuthenticationRequest={this.props.confirmAuthenticationRequest}
        cancelAuthenticationRequest={this.props.cancelAuthenticationRequest}
      />
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  activeAuthenticationRequest: state.sso.activeAuthenticationRequest,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  confirmAuthenticationRequest: () => sendAuthenticationResponse,
  cancelAuthenticationRequest: () => cancelSSO,
})

export const AuthenticationConsent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AuthenticationConsentContainer)
