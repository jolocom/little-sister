import React from 'react'
import { connect } from 'redux/utils'
import Presentation from '../presentation/phrase-info'

@connect({
  props: ['registration'],
  actions: ['registration:goForward', 'registration:setUserType']
})
export default class RegistrationPhraseInfoScreen extends React.Component {
  static propTypes = {
    registration: React.PropTypes.object.isRequired,
    setUserType: React.PropTypes.func.isRequired,
    goForward: React.PropTypes.func.isRequired
  }

  render() {
    return <Presentation
      onChange={this.props.setUserType}
      onSubmit={this.props.goForward}
    />
  }
}
