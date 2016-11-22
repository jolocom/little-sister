import {Parser, Writer} from '../rdf'
import LDPAgent from './ldp'
import Util from '../util'
import {PRED, SOLID} from '../namespaces.js'
import N3 from 'n3'
import _ from 'lodash'
import $rdf from 'rdflib'
import ConversationsStore from 'stores/conversations'

import Debug from 'lib/debug'
let debug = Debug('agents:chat')

let N3Util = N3.Util

// Chat related functions
class ChatAgent extends LDPAgent {

  // @param {String} initiator itiator's webid url
  // @param {Array.<String>} participants webids (including the initiator)
  //
  // @return {Promise.<Object>} object containing conversation id and doc url
  createConversation(initiator, participants) {
    let existingConversation =
      ConversationsStore.getConversationByWebId(participants[1])
    if (existingConversation) {
      debug('Found an existing conversation with', participants[1])
      return new Promise((resolve, reject) => {
        resolve({
          conversation: {
            id: existingConversation.id,
            url: existingConversation.uri
          },
          isNew: false
        })
      })
    } else {
      debug('Haven\'t found an existing conversation with', participants[1])
      // POST conversation to initiators container
      // update inbox indices of all participants
      let conversationId = Util.randomString(5)
      let conversationDoc =
        `${Util.webidRoot(initiator)}/little-sister/chats/${conversationId}`
      let hdrs = {'Content-type': 'text/turtle'}
      let conversationDocContent =
        this._conversationTriples(initiator, participants)
      return this.put(Util.uriToProxied(conversationDoc),
        hdrs, conversationDocContent).then(() => {
          return Promise.all(participants.map((p) =>
            this._linkConversation(conversationDoc, p)
        ))
        })
      .then(() => {
        return this._writeConversationAcl(conversationDoc,
          initiator, participants)
      })
      .then(() => {
        return {
          conversation: {
            id: conversationId,
            url: conversationDoc
          },
          isNew: true
        }
      })
    }
  }

  _writeConversationAcl(uri, initiator, participants = []) {
    let writer = new Writer()
    let ACL = $rdf.Namespace('http://www.w3.org/ns/auth/acl#')
    let aclUri = `${uri}.acl`

    writer.addTriple($rdf.sym('#owner'), PRED.type, ACL('Authorization'))
    writer.addTriple($rdf.sym('#owner'), ACL('accessTo'), $rdf.sym(uri))
    writer.addTriple($rdf.sym('#owner'), ACL('accessTo'), $rdf.sym(aclUri))
    writer.addTriple($rdf.sym('#owner'), ACL('agent'), $rdf.sym(initiator))
    writer.addTriple($rdf.sym('#owner'), ACL('mode'), ACL('Control'))
    writer.addTriple($rdf.sym('#owner'), ACL('mode'), ACL('Read'))
    writer.addTriple($rdf.sym('#owner'), ACL('mode'), ACL('Write'))

    participants.forEach((participant) => {
      writer.addTriple(
        $rdf.sym('#participant'),
        PRED.type,
        ACL('Authorization')
      )
      writer.addTriple($rdf.sym('#participant'), ACL('accessTo'), $rdf.sym(uri))
      writer.addTriple($rdf.sym('#participant'),
        ACL('agent'), $rdf.sym(participant))
      writer.addTriple($rdf.sym('#participant'), ACL('mode'), ACL('Read'))
      writer.addTriple($rdf.sym('#participant'), ACL('mode'), ACL('Write'))
    })

    return fetch(Util.uriToProxied(aclUri), {
      method: 'PUT',
      credentials: 'include',
      body: writer.end(),
      headers: {
        'Content-Type': 'text/turtle'
      }
    }).then(() => {
      return aclUri
    }).catch((e) => {
      console.error(e, 'occured while putting the acl file')
    })
  }

  _getMessageTriples({id, conversationId, author, content, created}) {
    if (!N3Util.isLiteral(content)) {
      content = N3Util.createLiteral(content)
    }

    if (!N3Util.isLiteral(created)) {
      created = N3Util.createLiteral(created)
    }

    return [{// this is a message
      subject: id,
      predicate: PRED.type,
      object: PRED.post
    }, { // written by...
      subject: id,
      predicate: PRED.hasCreator,
      object: author
    }, { // with content...
      subject: id,
      predicate: PRED.content,
      object: content
    }, { // with timestamp...
      subject: id,
      predicate: PRED.created,
      object: created
    }, { // contained by
      subject: id,
      predicate: PRED.hasContainer,
      object: conversationId
    }, {
      subject: conversationId,
      predicate: PRED.containerOf,
      object: id
    }]
  }

  postMessage(conversationUrl, author, content) {
    const conversationId = `${conversationUrl}#thread`
    const message = {
      id: `#${Util.randomString(5)}`,
      conversationId,
      author,
      content,
      created: new Date().getTime()
    }

    return this.get(Util.uriToProxied(conversationUrl)).then((xhr) => {
      // store this in memory, so we dont need to fetch all data everytime
      const conversation = $rdf.graph()
      $rdf.parse(
        xhr.response,
        conversation,
        conversationId,
        'text/turtle'
      )
      return conversation
    }).then((conversation) => {
      const graph = $rdf.graph()
      const uri = Util.uriToProxied(conversationUrl)

      graph.addAll(this._getMessageTriples(message))

      return this.patch(uri, null, graph.statements).then(() => {
        const participants = conversation.each(
          '#thread',
          PRED.hasSubscriber,
          undefined
        ).map((l) => l.value)

        this.notifyParticipants(participants, message)
      })
    })
  }
  getConversationMessages(conversationUrl) {
    return this.get(Util.uriToProxied(conversationUrl))
      .then((xhr) => {
        let parser = new Parser()
        return parser.parse(xhr.response, conversationUrl)
      })
      .then((result) => {
        let posts = result.triples.filter((t) => {
          return t.predicate.uri === PRED.type.uri &&
            t.object.uri === PRED.post.uri
        }).map((t) => t.subject)
        let groups = posts.reduce((acc, curr) => {
          if (!(curr in acc)) {
            acc[curr] = {
              id: curr.toString()
            }
          }
          for (var t of result.triples) {
            if (t.subject !== curr) {
              continue
            }
            if (t.predicate.uri === PRED.content.uri) {
              acc[curr].content = N3Util.getLiteralValue(t.object)
            }
            if (t.predicate.uri === PRED.created.uri) {
              acc[curr].created = new Date(
                parseInt(N3Util.getLiteralValue(t.object))
              )
            }
            if (t.predicate.uri === PRED.hasCreator.uri) {
              acc[curr].author = t.object.value
            }
          }
          return acc
        }, {})

        let msgs = []
        for (var p of posts) {
          msgs.push(groups[p])
        }
        msgs.sort((a, b) => a.created - b.created)

        return msgs
      })
  }
  // Returns relevant conversation metadata
  // (id, updatesVia, otherPerson, lastMessage)
  //
  // @param {String} conversationUrl conversation resource url
  //
  // @return {Object} conversation meta:
  // id, updatesVia, otherPerson, lastMessage
  getConversation(conversationUrl, myUri) {
    let result = {
      id: conversationUrl.replace(/^.*\/chats\/([a-z0-9]+)$/i, '$1')
    }
    return this.get(Util.uriToProxied(conversationUrl))
      .then((xhr) => {
        result.updatesVia = xhr.getResponseHeader('updates-via')
        let parser = new Parser()
        return parser.parse(xhr.response, conversationUrl)
      })
      .then((parsed) => {
        return Promise.all([
          this._lastMessage(conversationUrl),
          this._otherPerson(conversationUrl, parsed.triples, myUri)
        ])
      })
      .then((tmp) => {
        let [lastMessage, otherPerson] = tmp
        result.uri = conversationUrl
        result.lastMessage = lastMessage
        result.otherPerson = otherPerson
        return result
      })
      .catch(() => {
        console.error('Failed to load conversation', conversationUrl)
      })
  }

  _lastMessage(conversationUrl) {
    return this.getConversationMessages(conversationUrl)
      .then((messages) => {
        if (messages.length === 0) {
          return null
        } else {
          return messages[messages.length - 1]
        }
      })
  }

  _getParticipants(uri, triples) {
    let aboutThread = _.filter(triples, (t) => {
      return t.subject.value === '#thread' || t.subject.value ===
        `${uri}#thread`
    })

    return _.map(_.filter(aboutThread, (t) => {
      return t.predicate.uri === PRED.hasSubscriber.uri
    }), (t) => t.object.value)
  }

  _otherPerson(uri, triples, myUri) {
    let participants = this._getParticipants(uri, triples)
    let otherPerson = _.find(participants, (p) => p !== myUri)

    if (!otherPerson) {
      return Promise.resolve({})
    }

    let result = {}
    return this.get(Util.uriToProxied(otherPerson))
      .then((xhr) => {
        let parser = new Parser()
        return parser.parse(xhr.response, otherPerson)
      })
      .then((parsed) => {
        let aboutPerson = _.filter(parsed.triples, (t) => {
          return t.subject.uri === otherPerson || t.subject.uri === '#me'
        })

        let name = _.find(parsed.triples, (t) => {
          return t.predicate.uri === PRED.givenName.uri
        })

        if (name) {
          result.name = name.object.value
        }

        let img = _.find(aboutPerson, (t) => {
          return t.predicate.uri === PRED.image.uri
        })
        if (img) {
          result.img = img.object.value
        }

        result.webid = otherPerson
        return result
      })
  }

  getInboxConversations(webid) {
    let inbox = `${Util.webidRoot(webid)}/little-sister/inbox`
    debug('Getting inbox conversations for webid', inbox)
    return this.get(Util.uriToProxied(inbox))
      .then((xhr) => {
        let parser = new Parser()
        return parser.parse(xhr.response, inbox)
      })
      .then((result) => {
        debug('Received inbox conversations', result)
        return result.triples.filter((t) => {
          return t.predicate.uri === PRED.spaceOf.uri
        }).map((t) => t.object.value || t.object.uri)
      })
  }

  getUnreadMessagesContainer(webId) {
    return `${Util.webidRoot(webId)}/little-sister/unread-messages`
  }

  _parseMessages(g) {
    const schema = {
      author: PRED.hasCreator,
      content: PRED.content,
      created: PRED.created,
      conversationId: PRED.hasContainer
    }
    const subjects = g.statementsMatching(undefined, PRED.type, PRED.post)

    const messages = []

    subjects.forEach(({subject}) => {
      const id = subject.toString()

      let message = {
        id
      }

      for (let field in schema) {
        let value = g.any(id, schema[field])

        if (value) {
          message[field] = value.toString()
        }
      }

      messages.push(message)
    })

    return messages
  }

  getUnreadMessages(webId) {
    let container = this.getUnreadMessagesContainer(webId)
    return this.get(Util.uriToProxied(container))
      .then((xhr) => {
        const g = $rdf.graph()

        $rdf.parse(xhr.response, g, container, 'text/turtle')

        return g
      })
      .then(this._parseMessages)
  }

  notifyParticipants(participants, message) {
    participants.forEach((participant) => {
      if (participant !== message.author) {
        this.addUnreadMessage(participant, message)
      }
    })
  }

  addUnreadMessage(participant, message) {
    const container = this.getUnreadMessagesContainer(participant)
    const graph = $rdf.graph()

    graph.add(message.id, PRED.type, SOLID.Notification)

    graph.addAll(this._getMessageTriples(message))

    return this.patch(Util.uriToProxied(container), null, graph.statements)
  }

  removeUnreadMessage(webId, message) {
    const container = this.getUnreadMessagesContainer(webId)

    // @TODO use SPARQL DELETE here, this is kinda ugly :)
    const graph = $rdf.graph()

    graph.add(message.id, PRED.type, SOLID.Notification)

    graph.addAll(this._getMessageTriples(message))

    return this.patch(Util.uriToProxied(container), graph.statements)
  }

  _linkConversation(conversationUrl, webid) {
    const inbox = `${Util.webidRoot(webid)}/little-sister/inbox`
    const graph = $rdf.graph()

    graph.add('#inbox', PRED.spaceOf, $rdf.lit(conversationUrl))

    this.patch(Util.uriToProxied(inbox),
      null, graph.statementsMatching('#inbox', undefined, undefined)
    )
  }

  _conversationTriples(initiator, participants) {
    let writer = new Writer()

    let triples = [
      {
        subject: '',
        predicate: PRED.title,
        object: N3Util.createLiteral(`Conversation created by ${initiator}`)
      },
      {
        subject: '',
        predicate: PRED.maker,
        object: initiator
      },
      {
        subject: '',
        predicate: PRED.primaryTopic,
        object: '#thread'
      },
      {
        subject: '#thread',
        predicate: PRED.type,
        object: PRED.Thread
      },
      {
        subject: '#thread',
        predicate: PRED.hasOwner,
        object: initiator
      }
    ]

    for (var t of triples) {
      writer.addTriple(t)
    }

    // Participant list
    for (var p of participants) {
      writer.addTriple({
        subject: '#thread',
        predicate: PRED.hasSubscriber,
        object: p
      })
    }

    return writer.end()
  }

}

export default ChatAgent
