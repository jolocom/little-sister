import Reflux from 'reflux'

import ChatAgent from 'lib/agents/chat'
import WebIDAgent from 'lib/agents/webid'

import Subscription from 'lib/subscription'

import UnreadMessagesActions from 'actions/unread-messages'

import accountActions from '../actions/account'

import _ from 'lodash'

const {load, read} = UnreadMessagesActions

const subscriptions = {}

export default Reflux.createStore({
  listenables: UnreadMessagesActions,

  items: [],

  init: function() {
    this.agent = new ChatAgent()

    this.listenTo(accountActions.logout, this.onLogout)
  },

  getInitialState() {
    return {
      items: this.items
    }
  },

  onLogout() {
    this.items = []
  },

  onSubscribe(webId) {
    if (subscriptions[webId]) {
      return
    }

    const container = this.agent.getUnreadMessagesContainer(webId)

    subscriptions[webId] = new Subscription(container, () => {
      UnreadMessagesActions.load(webId)
    })
  },

  onUnsubscribe(webId) {
    if (subscriptions[webId]) {
      subscriptions[webId].stop()
      delete subscriptions[webId]
    }
  },

  onLoad(webId, subscribe) {
    this.agent.getUnreadMessages(webId).then((items) => {
      if (subscribe) {
        UnreadMessagesActions.subscribe(webId)
      }
      load.completed(items)
    }).catch((error) => {
      // @TODO container should be created by the solid server
      if (error.message === '404') {
        const wia = new WebIDAgent()
        wia.createUnreadMessagesContainer(webId)
      }

      return load.failed(error)
    })
  },

  onLoadCompleted(items) {
    this.items = items

    this.trigger({
      items: this.items
    })
  },

  onLoadFailed() {},

  onRead(webId, messageId) {
    const message = _.find(this.items, {id: messageId})
    if (!message) {
      return
    }

    this.agent.removeUnreadMessage(webId, message)
      .then(() => {
        read.completed(messageId)
      })
      .catch(read.failed)
  },

  onReadCompleted(messageId) {
    this.items = _.filter(this.items, (message) => {
      return message.id !== messageId
    })

    this.trigger({
      items: this.items
    })
  },

  onReadFailed() {},

  isUnread(messageId) {
    for (let message in this.items) {
      if (message.id === messageId) {
        return true
      }
    }
  },

  unreadMessages(conversationUri) {
    let messages = []

    for (let message of this.items) {
      if (message.conversationId.match(conversationUri)) {
        messages.push(message)
      }
    }

    return messages
  }
})
