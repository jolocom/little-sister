import React from 'react'
import Reflux from 'reflux'
import Dialog from 'components/common/dialog'
import CopyToClipboard from 'react-copy-to-clipboard'
import nodeActions from 'actions/node'
import {Layout, Content} from 'components/layout'
import ProfileActions from 'actions/profile'
import Radium from 'radium'
import NodeStore from 'stores/node'
import graphActions from 'actions/graph-actions'

import FloatingActionButton from 'material-ui/FloatingActionButton'
import ActionBookmark from 'material-ui/svg-icons/action/bookmark'
import CommunicationChat from 'material-ui/svg-icons/communication/chat'
import ContentLink from 'material-ui/svg-icons/content/link'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import ShareIcon from 'material-ui/svg-icons/content/reply'

import {
  AppBar,
  IconButton,
  IconMenu,
  MenuItem
} from 'material-ui'

let GenericFullScreen = React.createClass({
  mixins: [
    Reflux.connect(NodeStore, 'node')
  ],

  propTypes: {
    node: React.PropTypes.object,
    center: React.PropTypes.object,
    navHistory: React.PropTypes.object,
    onClose: React.PropTypes.func,
    backgroundImg: React.PropTypes.any,
    menuItems: React.PropTypes.arrayOf(React.PropTypes.string),
    copyToClipboardText: React.PropTypes.any,
    title: React.PropTypes.string,
    fabItems: React.PropTypes.arrayOf(React.PropTypes.string),
    children: React.PropTypes.any
  },

  contextTypes: {
    history: React.PropTypes.any,
    node: React.PropTypes.object,
    muiTheme: React.PropTypes.object,
    account: React.PropTypes.object
  },

  componentWillMount() {
    this.props.menuItems.unshift('fullscreen')
  },

  componentDidMount() {
    this.refs.dialog.show()
  },

  componentWillUnmount() {
    this.refs.dialog.hide()
  },

  getStyles() {
    let {muiTheme} = this.context
    let {gray1} = muiTheme.jolocom

    return {
      container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      },
      headers: {
        color: '#ffffff',
        height: this.state.fullscreen ? '90vh' : '176px',
        background: `${gray1} ${this.props.backgroundImg} center / cover`,
        boxShadow: 'none'
      },
      title: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        padding: '0 24px',
        color: '#ffffff'
      },
      floatingButtons: {
        position: 'absolute',
        top: this.state.fullscreen ? '90vh' : '176px',
        right: '10px',
        marginTop: '-28px',
        zIndex: 1500
      },
      fabBtn: {
        margin: '0px 10px'
      },
      fabIcon: {
        fill: '#9a3460'
      }
    }
  },

  _handleClose() {
    graphActions.setState('activeNode', null, true)
    this.context.history.pushState(null, '/graph')
  },

  _handleDisconnect() {
    if (this.props.node.rank !== 'center') {
      nodeActions.disconnectNode(
        this.props.node, this.props.center
      )
    }
    this._handleClose()
  },

  _handleDelete() {
    let node = this.props.state.activeNode
    let center = this.props.state.center
    let navHis = this.props.state.navHistory

    if (node.rank === 'center') {
      let prev = navHis[navHis.length - 1]
      graphActions.drawAtUri(prev.uri, 1).then(() => {
        nodeActions.remove(node, prev)
      })
    }
    else
    {
      nodeActions.remove(node, center)
    }
    
    this._handleClose()
  },

  getNode() {
    return this.props.node
  },

  bookmarkFn() {
    alert('woohoo bookmark!')
  },

  connectFn() {
    alert('woohoo connect!')
  },

  _handleFull() {
    this.setState({fullscreen: !this.state.fullscreen})
  },

  // menuItem (optional?)
  getAction(iconString) {
    switch (iconString) {
      case 'chat':
        return {
          title: 'Chat',
          icon: <CommunicationChat />,
          handler: this._handleStartChat}
      case 'bookmark':
        return {
          title: 'Bookmark',
          icon: <ActionBookmark />,
          handler: this.bookmarkFn}
      case 'connect':
        return {
          title: 'Connect',
          icon: <ContentLink />,
          handler: this.connectFn}
      case 'delete':
        return {title: 'Delete', handler: this._handleDelete}
      case 'disconnect':
        return {
          title:
          'Disconnect',
          icon: <ContentLink />,
          handler: this._handleDisconnect
        }
      case 'edit':
        return {
          title: 'Edit',
          handler: this._handleEdit,
          icon: <EditorModeEdit />
        }
      case 'fullscreen':
        return {
          handler: this._handleFull,
          title: this.state.fullscreen ? 'Exit full screen' : 'Full screen'
        }
      case 'copyUrl': // @TODO not optimal
        return {
          icon: <ShareIcon />,
          menuItem: (
            <CopyToClipboard
              text={this.props.copyToClipboardText}
              onCopy={this._handlePostCopyURL}
            >
              <MenuItem primaryText="Copy URL" />
            </CopyToClipboard>),
          fabItem: (
            <CopyToClipboard
              text={this.props.copyToClipboardText}
              onCopy={this._handlePostCopyURL}
            >
              <FloatingActionButton
                style={this.getStyles().fabBtn}
                secondary
              >
                <ShareIcon />
              </FloatingActionButton>
            </CopyToClipboard>)
        }

      /* case 'copy':
        return (<ContentCopy />)
      case 'save':
        return (<ContentSave />)
      case 'read':
        return (<CommunicationImportContacts />)
      case 'edit':
        return (<EditorModeEdit />)*/
      default:
        console.error('No action info found for', iconString)
        return {}
        // return (<AlertError />)
    }
  },

  _handleBookmarkClick() {
    const {uri} = this.getNode()
    if (uri) {
      // @TODO fix bookmarking
      // PinnedActions.pin(uri)
    }
  },

  _handlePostCopyURL() {
    alert('The URL of the node has been copied to your clipboard.')
    // @todo snackbar/toast
  },

  _handleEdit() {
    ProfileActions.show()
  },

  _handleStartChat() {
    const {history} = this.context
    const {node} = this.props
    history.pushState(null, `/chat/new/${encodeURIComponent(node.uri)}`)
    graphActions.setState('activeNode', null, true)
  },

  render() {
    let styles = this.getStyles()

    // @TODO bind handlers to preset actions here
    // in: {name: 'disconnect'}
    // out: {name: 'disconnect',
    //    component: <Disconnect>, handler: disconnecthandler} (overwritable)
    // map ((e) return object.assign({}, default, e))

    // @TODO pass fab 0-3 and set which one is primary (flag?),
    //    or reverse? ['primary','other button', 'other button']

    // @TODO externalize fab handlers + component etc

    // Always add the fullscreen menu item

    return (
      <Dialog ref="dialog" fullscreen>
        <Layout>
          <Content>
            <div style={styles.container}>
              <AppBar
                style={styles.headers}
                titleStyle={styles.title}
                title={<span>{this.props.title || 'No title'}</span>}
                iconElementRight={
                  <IconMenu
                    iconButtonElement={
                      <IconButton
                        iconClassName="material-icons"
                        iconStyle={styles.icon}>
                          more_vert
                      </IconButton>
                    }
                    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}>

                    {this.props.menuItems.map((menuItem) => {
                      let menuItemInfo = this.getAction(menuItem)
                      if ('menuItem' in menuItemInfo) {
                        return menuItemInfo.menuItem
                      }
                      return (
                        <MenuItem
                          primaryText={menuItemInfo.title}
                          onTouchTap={menuItemInfo.handler} />
                      )
                    })}
                  </IconMenu>
                }
                iconElementLeft={
                  <IconButton
                    iconClassName="material-icons"
                    iconStyle={styles.icon}
                    onClick={this._handleClose}>
                      arrow_back
                  </IconButton>
                  }
              />
              <div style={styles.floatingButtons}>
                  {this.props.fabItems.map((fabItem, i) => {
                    let fabItemInfo = this.getAction(fabItem)
                    if ('fabItem' in fabItemInfo) {
                      return fabItemInfo.fabItem
                    }

                    let lastItem = i === this.props.fabItems.length - 1
                    return (
                      <FloatingActionButton
                        backgroundColor={!lastItem ? '#fff' : 'inherit'}
                        style={styles.fabBtn}
                        secondary={lastItem}
                        iconStyle={!lastItem ? styles.fabIcon : {}}
                        onTouchTap={this.getAction(fabItem).handler}>
                        {this.getAction(fabItem).icon}
                      </FloatingActionButton>
                    )
                  })}
              </div>
              {this.props.children}
            </div>
          </Content>
        </Layout>
      </Dialog>
    )
  }
})

export default Radium(GenericFullScreen)
