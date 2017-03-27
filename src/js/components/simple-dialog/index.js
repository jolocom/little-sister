import React from 'react'
import { connect } from 'redux/utils'

import { FlatButton, Dialog } from 'material-ui'

@connect({
  props: ['simpleDialog'],
  actions: ['simple-dialog:hideSimpleDialog']
})
export default class SimpleDialog extends React.Component {
  static propTypes = {
    hideSimpleDialog: React.PropTypes.func,
    simpleDialog: React.PropTypes.object
  }

  _handleOK() {
    this.props.hideSimpleDialog()
  }

  render() {
    const OKHandler = () => this._handleOK()

    const simpleActions = [
      <FlatButton
        label={this.props.simpleDialog.primaryActionText === undefined ? 'OK'
        : this.props.simpleDialog.primaryActionText}
        primary
        onTouchTap={OKHandler}
      />
    ]

    return <Dialog
      actions={simpleActions}
      modal={false}
      open={this.props.simpleDialog.visible}
      onRequestClose={this.handleClose}
    >
      {this.props.simpleDialog.message}
    </Dialog>
  }
}
