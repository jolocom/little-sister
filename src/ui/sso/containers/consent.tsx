import React from 'react'
import { connect } from 'react-redux'
import {
  StateCredentialRequestSummary,
  StateVerificationSummary,
} from 'src/reducers/sso'
import { ConsentComponent } from 'src/ui/sso/components/consent'
import { ssoActions } from 'src/actions'
import {ThunkDispatch} from '../../../store'
import {cancelSSO, sendCredentialResponse} from '../../../actions/sso'

interface ConnectProps {}

interface Props extends ConnectProps {
  activeCredentialRequest: StateCredentialRequestSummary
  currentDid: string
  sendCredentialResponse: typeof sendCredentialResponse
  cancelSSO: () => ReturnType<typeof cancelSSO>
}

interface State {}

export class ConsentContainer extends React.Component<Props, State> {
  private handleSubmitClaims = (credentials: StateVerificationSummary[]) => {
    this.props.sendCredentialResponse(credentials)
  }

  private handleDenySubmit = () => {
    this.props.cancelSSO()
  }

  render() {
    const {
      availableCredentials,
      requester,
      callbackURL,
    } = this.props.activeCredentialRequest
    return (
      <ConsentComponent
        requester={requester}
        callbackURL={callbackURL}
        did={this.props.currentDid}
        availableCredentials={availableCredentials}
        handleSubmitClaims={this.handleSubmitClaims}
        handleDenySubmit={this.handleDenySubmit}
      />
    )
  }
}

const mapStateToProps = (state: any) => ({
  activeCredentialRequest: state.sso.activeCredentialRequest,
  currentDid: state.account.did.did,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  sendCredentialResponse: ssoActions.sendCredentialResponse,
  cancelSSO: () => dispatch(ssoActions.cancelSSO),
})

export const Consent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentContainer)
