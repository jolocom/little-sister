import React from 'react'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers/'
import { DecoratedClaims } from 'src/reducers/account'

import {
  convertToDecoratedClaim,
  saveExternalCredentials,
} from 'src/actions/account'
import { CredentialDialogComponent } from '../components/credentialDialog'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {cancelReceiving, cancelSSO} from 'src/actions/sso'
import { ButtonSection } from 'src/ui/structure/buttonSectionBottom'
import { View } from 'react-native'
import { ThunkDispatch} from '../../../store'

interface ConnectProps {
  externalCredentials: SignedCredential[]
  saveExternalCredentials: () => ReturnType<typeof saveExternalCredentials>
  goBack: () => ReturnType<typeof cancelSSO>
}

interface Props extends ConnectProps {}

interface State {
  toRender: DecoratedClaims
}

export class CredentialsReceiveContainer extends React.Component<Props, State> {
  state = {
    toRender: convertToDecoratedClaim(this.props.externalCredentials)[0],
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.9 }}>
          <CredentialDialogComponent credentialToRender={this.state.toRender} />
        </View>
        <ButtonSection
          confirmText={'Accept'}
          denyText={'Deny'}
          handleConfirm={this.props.saveExternalCredentials}
          handleDeny={this.props.goBack}
          disabled={false}
        />
      </View>
    )
  }
}

const mapStateToProps = ({
  account: {
    claims: { pendingExternal: externalCredentials },
  },
}: RootState) => {
  return {
    externalCredentials,
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  saveExternalCredentials: () => dispatch(saveExternalCredentials),
  goBack: () => dispatch(cancelReceiving),
})

export const CredentialReceive = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CredentialsReceiveContainer)
