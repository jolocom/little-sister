import React from 'react'
import { connect } from 'react-redux'
import { PaymentStateSummary } from 'src/reducers/payment'
import { paymentActions } from 'src/actions'
import { PaymentConsentComponent } from '../components/paymentConsent'

interface ConnectProps {}

interface Props extends ConnectProps {
  activePaymentRequest: PaymentStateSummary
  confirmPaymentRequest: () => void
  cancelPaymentRequest: () => void
}

interface State {}

export class PaymentConsentContainer extends React.Component<Props, State> {

  render() {
    return (
      <PaymentConsentComponent
        requester={this.props.activePaymentRequest.didRequester}
        description={this.props.activePaymentRequest.description}
        transactionDetails={this.props.activePaymentRequest.transactionDetails}
        confirmPaymentRequest={this.props.confirmPaymentRequest}
        cancelPaymentRequest={this.props.cancelPaymentRequest}
      />
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    activePaymentRequest: state.payment.activePaymentRequest
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    confirmPaymentRequest: () => dispatch(paymentActions.sendPaymentResponse()),
    cancelPaymentRequest: () => dispatch(paymentActions.cancelPaymentRequest())
  }
}

export const PaymentConsent = connect(
  mapStateToProps,
  mapDispatchToProps
)(PaymentConsentContainer)
