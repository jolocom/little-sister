import React from 'react'
import Radium from 'radium'
import { connect } from 'redux/utils'
import {Badge, IconButton} from 'material-ui'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'

@connect({
  actions: ['left-nav:showLeftNav']
})
@Radium
export default class LeftNavToggle extends React.Component {
  static propTypes = {
    showLeftNav: React.PropTypes.func.isRequired
  }
  render() {
    const styles = {
      menuIcon: {
        cursor: 'pointer'
      },
      navBadge: {
        padding: 0
      },
      hamburgerBadge: {
        top: -4,
        right: -4,
        width: 12,
        height: 12,
        display: 'none'
      }
    }

    return (
      <Badge
        badgeContent={''}
        secondary
        style={styles.navBadge}
        badgeStyle={styles.hamburgerBadge}>
        <IconButton
          onTouchTap={this._handleShowDrawer}
        >
          <NavigationMenu
            style={styles.menuIcon} />
        </IconButton>
      </Badge>
    )
  }

  _handleShowDrawer = () => {
    this.props.showLeftNav()
  }
}
