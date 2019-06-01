import React from 'react'
import { ButtonSection } from 'src/ui/structure/buttonSectionBottom'
import { Text, StyleSheet, View } from 'react-native'
import I18n from 'src/locales/i18n'
import { StateAuthenticationRequestSummary } from 'src/reducers/sso'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import {sendAuthenticationResponse} from '../../../actions/sso/authenticationRequest'
import {cancelSSO} from '../../../actions/sso'

interface Props {
  activeAuthenticationRequest: StateAuthenticationRequestSummary
  confirmAuthenticationRequest: () => typeof sendAuthenticationResponse
  cancelAuthenticationRequest: () => typeof cancelSSO
}

interface State {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  requesterContainer: {
    flexDirection: 'row',
    backgroundColor: JolocomTheme.primaryColorWhite,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 25,
  },
  requesterIcon: {
    backgroundColor: JolocomTheme.primaryColorGrey,
    width: 42,
    height: 42,
  },
  requesterTextContainer: {
    marginLeft: 16,
    flex: -1,
  },
  authRequestContainer: {
    flex: 1,
    paddingHorizontal: '10%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 35,
  },
  authRequestText: {
    ...JolocomTheme.textStyles.light.textDisplayField,
    textAlign: 'center',
    fontWeight: '300',
    marginTop: 10,
  },
})

export class AuthenticationConsentComponent extends React.Component<
  Props,
  State
> {
  state = {
    pending: false,
  }

  private handleConfirm = () => {
    this.setState({ pending: true })
    return this.props.confirmAuthenticationRequest()
  }

  private renderRequesterCard(requester: string, callbackURL: string) {
    return (
      <View style={styles.requesterContainer}>
        <View style={styles.requesterIcon} />
        <View style={styles.requesterTextContainer}>
          <Text
            style={JolocomTheme.textStyles.light.textDisplayField}
            numberOfLines={1}
          >
            {requester}
          </Text>
          <Text
            style={JolocomTheme.textStyles.light.labelDisplayField}
            numberOfLines={1}
          >
            {callbackURL}
          </Text>
        </View>
      </View>
    )
  }

  private renderAuthRequest(description: string) {
    return (
      <View style={styles.authRequestContainer}>
        <Text style={styles.authRequestText}>
          {I18n.t('Would you like to')}
        </Text>
        <Text style={[styles.authRequestText, { fontSize: 42 }]}>
          {description}
        </Text>
        <Text style={styles.authRequestText}>
          {I18n.t('with your SmartWallet?')}
        </Text>
      </View>
    )
  }

  private renderButtons() {
    return (
      <ButtonSection
        disabled={this.state.pending}
        denyDisabled={this.state.pending}
        confirmText={I18n.t('Authorize')}
        denyText={I18n.t('Deny')}
        handleConfirm={this.handleConfirm}
        handleDeny={() => this.props.cancelAuthenticationRequest()} // TODO Does this get dispatched correctly?
        verticalPadding={10}
      />
    )
  }

  render() {
    const {
      requester,
      callbackURL,
      description,
    } = this.props.activeAuthenticationRequest
    return (
      <View style={styles.container}>
        {this.renderRequesterCard(requester, callbackURL)}
        {this.renderAuthRequest(description)}
        {this.renderButtons()}
      </View>
    )
  }
}
