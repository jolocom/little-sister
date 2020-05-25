import React, { ReactNode } from 'react'
import { ButtonSection } from 'src/ui/structure/buttonSectionBottom'
import { View, Text, StyleSheet } from 'react-native'
import I18n from 'src/locales/i18n'
import { Wrapper } from 'src/ui/structure'
import { getCredentialIconByType } from 'src/resources/util'
import { formatEth } from 'src/utils/formatEth'
import strings from '../../../locales/strings'
import { Colors, Typography, Spacing } from 'src/styles'
import { PaymentConsentCard } from './paymentConsentCard'
import { IssuerCard } from '../../documents/components/issuerCard'
import { PaymentRequestSummary } from '../../../actions/sso/types'

interface Props {
  paymentDetails: PaymentRequestSummary
  cancelPaymentRequest: () => void
  confirmPaymentRequest: () => void
}

interface State {}

const styles = StyleSheet.create({
  priceContainer: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceAmount: {
    ...Typography.baseFontStyles,
    fontSize: Typography.text3XL,
    color: Colors.blackMain,
  },
  priceUnit: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXL,
    color: Colors.blackMain050,
    marginLeft: Spacing.XXS,
  },
  cardContainer: {
    flex: 0.6,
    // each card has its own bottom border, this adds the top border
    borderColor: Colors.lightGrey,
    borderTopWidth: 1,
  },
  buttonContainer: {
    flex: 0.1,
  },
})

export class PaymentConsentComponent extends React.Component<Props, State> {
  public state = {
    pending: false,
  }

  private handleConfirm = (): void => {
    this.setState({ pending: true })
    this.props.confirmPaymentRequest()
  }

  private renderLeftIcon(type: string): ReactNode {
    return getCredentialIconByType(type)
  }

  public render(): JSX.Element {
    const {
      amount,
      description,
      receiver: { did, address },
      requester,
    } = this.props.paymentDetails
    const { formattedAmount, unit } = formatEth(amount)

    return (
      <Wrapper>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{formattedAmount}</Text>
          <Text style={styles.priceUnit}>{unit}</Text>
        </View>

        {/* Who the payment goes to and what the payment is for */}
        <View style={styles.cardContainer}>
          <IssuerCard issuer={requester} />
          <PaymentConsentCard
            leftIcon={this.renderLeftIcon(I18n.t(strings.EMAIL))}
            title={`${I18n.t(strings.TO)}:`}
            primaryText={did}
            secondaryText={`Eth address: ${address}`}
          />
          <PaymentConsentCard
            leftIcon={this.renderLeftIcon(I18n.t(strings.OTHER))}
            title={`${I18n.t(strings.FOR)}:`}
            primaryText={description}
          />
        </View>

        <View style={styles.buttonContainer}>
          <ButtonSection
            disabled={this.state.pending}
            denyDisabled={this.state.pending}
            confirmText={I18n.t(strings.CONFIRM)}
            denyText={I18n.t(strings.DENY)}
            handleConfirm={this.handleConfirm}
            handleDeny={(): void => this.props.cancelPaymentRequest()}
          />
        </View>
      </Wrapper>
    )
  }
}
