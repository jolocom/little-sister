import { ThunkDispatch } from '../../../store'
import { withErrorScreen, withLoading } from '../../../actions/modifiers'
import { ssoActions } from '../../../actions'
import { connect } from 'react-redux'
import { CredentialsReceiveContainer } from './credentialReceive'
import { SignedCredentialWithMetadata } from '@jolocom/sdk/js/interactionManager/types'

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  acceptSelectedCredentials: (
    selected: SignedCredentialWithMetadata[],
    interactionId: string,
  ) =>
    dispatch(
      withErrorScreen(
        withLoading(
          ssoActions.validateSelectionAndSave(selected, interactionId),
        ),
      ),
    ),
  goBack: () => dispatch(ssoActions.cancelSSO),
})

export const CredentialReceiveNegotiate = connect(
  null,
  mapDispatchToProps,
)(CredentialsReceiveContainer)
