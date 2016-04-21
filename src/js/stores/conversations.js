import Reflux from 'reflux'
import _ from 'lodash'
import settings from 'settings'
import ChatAgent from 'lib/agents/chat.js'

import ConversationsActions from 'actions/conversations'

let {load} = ConversationsActions

let chatAgent = new ChatAgent()

export default Reflux.createStore({
  listenables: ConversationsActions,

  getInitialState() {
    return {
      loading: true,
      items: []
    }
  },

  onLoad(username, query) {
    let regEx = query && query !== '' && new RegExp(`.*${query}.*`, 'i')

    return chatAgent.getInboxConversations(`${settings.endpoint}/${username}/profile/card#me`)
      .then(function(conversations) {
        let results = conversations.map((url) => chatAgent.getConversation(url))
        return Promise.all(results)
      })
      .then(function(conversations) {
        load.completed(_.chain(conversations).map((conversation) => {
          return conversation
        }).filter((conversation) => {
          return !regEx || conversation.id.match(regEx)
        }).value())
      })
  },

  onLoadCompleted(conversations) {
    this.trigger({
      loading: false,
      items: conversations
    })
  }

})
