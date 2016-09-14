import React from 'react'
import Reflux from 'reflux'

import Dialog from 'components/common/dialog.jsx'
import {Layout} from 'components/layout'

import ContactActions from 'actions/contact'
import ContactStore from 'stores/contact'

import Profile from '../node/fullscreen/types/profile'

export default React.createClass({

  mixins: [Reflux.connect(ContactStore, 'contact')],

  propTypes: {
    params: React.PropTypes.object
  },

  contextTypes: {
    router: React.PropTypes.any
  },

  componentDidMount() {
    ContactActions.load(this.props.params.username)
    this.open()
  },

  componentWillUnmount() {
    this.close()
  },

  open() {
    this.refs.dialog.show()
  },

  close() {
    this.refs.dialog.hide()
    this.context.router.push('/contacts')
  },

  toggle() {
    this.refs.dialog.toggle()
  },

  render() {
    let {contact} = this.state

    return (
      <Dialog ref="dialog" fullscreen visible={this.state.open}>
        <Layout>
          <Profile node={contact} onClose={this.close} />
        </Layout>
      </Dialog>
    )
  }
})
