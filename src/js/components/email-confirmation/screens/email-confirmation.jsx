import React from 'react'
import {connect} from 'redux/utils'
import Presentation from '../presentation/email-confirmation'

@connect({
  props: ['emailConfirmation'],
  actions: [
    'wallet-login:goToLogin',
    'verification:confirmEmail'
  ]
})
export default class EmailConfirmationScreen extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    location: React.PropTypes.object.isRequired,
    emailConfirmation: React.PropTypes.object.isRequired,
    goToLogin: React.PropTypes.func.isRequired,
    confirmEmail: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.confirmEmail({
      email: this.props.location.query.email,
      code: this.props.location.query.code
    })
  }

  render() {
    return (<Presentation
      onClick={this.props.goToLogin}
      confirmation={this.props.emailConfirmation.success}
      loading={this.props.emailConfirmation.loading} />)
  }
}
