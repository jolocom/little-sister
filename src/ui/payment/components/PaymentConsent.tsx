import React from 'react'
import { ButtonSection } from 'src/ui/structure/buttonSectionBottom'
import { View, Text, TextStyle, ViewStyle } from 'react-native'
import I18n from 'src/locales/i18n'
import { Container, Block } from 'src/ui/structure'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { getCredentialIconByType } from 'src/resources/util'
import { SectionClaimCard } from 'src/ui/structure/claimCard'
import { StatePaymentRequestSummary } from 'src/reducers/sso'
import { formatEth } from 'src/utils/formatEth'

interface Props {
  activePaymentRequest: StatePaymentRequestSummary
  cancelPaymentRequest: () => void
  confirmPaymentRequest: () => void
}

interface State {}

const styles = {
  priceCard: {
    container: {
      flexDirection: 'row',
    } as ViewStyle,
    price: {
      fontFamily: JolocomTheme.contentFontFamily,
      fontSize: JolocomTheme.landingHeaderFontSize,
      color: JolocomTheme.primaryColorBlack,
      fontWeight: JolocomTheme.fontWeight,
      paddingRight: '2%',
    } as TextStyle,
    unit: {
      fontFamily: JolocomTheme.contentFontFamily,
      fontSize: JolocomTheme.labelFontSize,
      alignSelf: 'center',
    } as TextStyle,
  },
  container: {
    padding: 0,
    margin: 0,
  },
  middleBlock: {
    justifyContent: 'flex-start',
  } as ViewStyle,
}

export class PaymentConsentComponent extends React.Component<Props, State> {
  state = {
    pending: false,
  }

  private handleConfirm = () => {
    this.setState({ pending: true })
    this.props.confirmPaymentRequest()
  }

  private renderButtons() {
    return (
      <ButtonSection
        disabled={this.state.pending}
        denyDisabled={this.state.pending}
        confirmText={I18n.t('Confirm')}
        denyText={I18n.t('Deny')}
        handleConfirm={this.handleConfirm}
        handleDeny={() => this.props.cancelPaymentRequest()}
      />
    )
  }

  private renderLeftIcon(type: string) {
    return getCredentialIconByType(type)
  }

  private renderPriceCard() {
    const { amount } = this.props.activePaymentRequest
    const { formattedAmount, unit } = formatEth(amount)
    return (
      <View style={styles.priceCard.container}>
        <Text style={styles.priceCard.price}>{formattedAmount}</Text>
        <Text style={styles.priceCard.unit}>{unit}</Text>
      </View>
    )
  }

  private renderTransactionDetails() {
    const {
      description,
      receiver: { did, address },
    } = this.props.activePaymentRequest
    return (
      <View style={{ width: '100%', margin: 0, padding: 0 }}>
        <SectionClaimCard
          title={`${I18n.t('For')}:`}
          primaryText={description}
          leftIcon={this.renderLeftIcon('Other')}
        />
        <SectionClaimCard
          title={`${I18n.t('To')}:`}
          primaryText={`${did.substring(0, 17)}...`}
          secondaryText={`Eth address: ${address.substring(0, 13)}...`}
          leftIcon={this.renderLeftIcon('Email')}
        />
      </View>
    )
  }

  render() {
    return (
      <Container style={styles.container}>
        <Block flex={0.3}>{this.renderPriceCard()}</Block>
        <Block flex={0.6} style={styles.middleBlock}>
          {this.renderTransactionDetails()}
        </Block>
        {this.renderButtons()}
      </Container>
    )
  }
}
