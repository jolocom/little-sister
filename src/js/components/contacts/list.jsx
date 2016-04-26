import React from 'react'
import Radium from 'radium'
import Reflux from 'reflux'

import {List, ListItem, Avatar} from 'material-ui'

import ContactsActions from 'actions/contacts'
import ContactsStore from 'stores/contacts'

let Contacts = React.createClass({

  mixins: [Reflux.connect(ContactsStore, 'contacts')],

  componentDidMount() {
    this.load()
  },

  componentDidUpdate(prevProps) {
    if (this.props.searchQuery !== prevProps.searchQuery) {
      this.load()
    }
  },

  load() {
    ContactsActions.load(this.props.searchQuery)
  },

  render() {
    return (
      <List>
        {this.state.contacts.map(({username, name, email, imgUri}) => {
          let avatar = <Avatar src={imgUri}>{name[0]}</Avatar>
          return (
            <ListItem key={username} primaryText={name} secondaryText={email} leftAvatar={avatar} onTouchTap={() => {this.props.onClick(username)}}/>
          )
        })}
      </List>
    )
  }

})

export default Radium(Contacts)
