import React from 'react'
import Radium from 'radium'
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle'
import {theme} from 'styles'

import {
  ListItem,
  FlatButton,
  Divider
} from 'material-ui'

const STYLES = {
  divider: {
    width: '100%'
  },
  addBtn: {
    margin: '8px 0',
    textAlign: 'left',
    color: theme.jolocom.gray1
  },
  infoHeader: {
    display: 'inline-block',
    textAlign: 'left',
    color: theme.jolocom.gray1,
    left: '10px',
    paddingBottom: '10px',
    verticalAlign: 'middle'
  },
  icon: {
    marginLeft: '0'
  },
  list: {
    padding: '16px 0px 16px 54px'
  }
}
const AddNew = ({value, onClick}) => {
  return (
    <ListItem
      disabled
      style={STYLES.list}>
      <FlatButton
        color={STYLES.addBtn.color}
        style={STYLES.addBtn}
        onClick={() => { onClick() }}
        label={value}
        icon={
          <ContentAddCircle
            style={STYLES.icon}
            color={STYLES.addBtn.color}
          />
        }
      />
      <Divider style={STYLES.divider} />
    </ListItem>
  )
}

AddNew.propTypes = {
  value: React.PropTypes.any,
  onClick: React.PropTypes.func.isRequired
}

export default Radium(AddNew)
