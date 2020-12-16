import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import I18n from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Colors, Typography, Spacing } from 'src/styles'
import { IssuerCard } from '../../documents/components/issuerCard'
import {
  InteractionSummary,
  AuthenticationFlowState,
} from '@jolocom/sdk/js/interactionManager/types'
import { ButtonSheet } from 'src/ui/structure/buttonSheet'
import { Wrapper } from '../../structure'

interface Props {
  interactionSummary: InteractionSummary
  confirmAuthenticationRequest: () => void
  cancelAuthenticationRequest: () => void
}

interface State {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLightMain,
  },
  topSection: {
    flex: 0.9,
  },
  issuerCard: {
    marginTop: Spacing.LG,
  },
  authRequestContainer: {
    flex: 1,
    paddingHorizontal: '10%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: Spacing.XL,
  },
  authRequestText: {
    ...Typography.baseFontStyles,
    ...Typography.centeredText,
    fontSize: Typography.textLG,
    marginTop: Spacing.SM,
  },
  buttonSection: {
    flex: 0.1,
  },
})

export class AuthenticationConsentComponent extends React.Component<
  Props,
  State
> {
  public state = {
    pending: false,
  }

  private handleConfirm = () => {
    this.setState({ pending: true })
    return this.props.confirmAuthenticationRequest()
  }

  public render() {
    const { initiator: issuer, state } = this.props.interactionSummary
    const { description } = state as AuthenticationFlowState
    return (
      <Wrapper>
        <View style={styles.topSection}>
          <IssuerCard issuer={issuer} style={styles.issuerCard} />
          <View style={styles.authRequestContainer}>
            <Text style={styles.authRequestText}>
              {I18n.t(strings.WOULD_YOU_LIKE_TO)}
            </Text>
            <Text
              style={[
                styles.authRequestText,
                { fontSize: Typography.text4XL },
              ]}>
              {description}
            </Text>
            <Text style={styles.authRequestText}>
              {I18n.t(strings.WITH_YOUR_SMARTWALLET)}
            </Text>
          </View>
        </View>
        <View style={styles.buttonSection}>
          <ButtonSheet
            disabledConfirm={this.state.pending}
            confirmText={strings.AUTHORIZE}
            cancelText={strings.DENY}
            onCancel={this.props.cancelAuthenticationRequest}
            onConfirm={this.handleConfirm}
          />
        </View>
      </Wrapper>
    )
  }
}
