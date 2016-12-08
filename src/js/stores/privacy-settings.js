import Reflux from 'reflux'
import Util from 'lib/util'
import PrivacyActions from 'actions/privacy-settings'
import AclAgent from 'lib/agents/acl'
import GraphAgent from 'lib/agents/graph'
import {Writer} from 'lib/rdf.js'
import rdf from 'rdflib'
import {PRED} from 'lib/namespaces'

export default Reflux.createStore({
  listenables: PrivacyActions,

  init() {
    this.gAgent = new GraphAgent()
    this.webId = localStorage.getItem('jolocom.webId')

    this.state = {
      currActiveViewBtn: 'visOnlyMe',
      currActiveEditBtn: 'editOnlyMe',

      viewAllowList: [],
      editAllowList: [],

      friendViewAllowList: [],
      friendViewDisallowList: [],

      friendEditDisallowList: [],

      isSelectAllOnlyMe: false,
      isSelectAllFriends: false,

      allowFriendList: []
    }
  },

  getInitialState() {
    return this.state
  },
  navigate(activeView, activeEdit) {
    if (activeView) {
      this.state.currActiveViewBtn = activeView
    }

    if (activeEdit) {
      this.state.currActiveEditBtn = activeEdit
    }

    this.trigger(this.state)
  },

  computeResult() {
    this.aclAgent.resetAcl()
    this.aclAgent.allow(this.webId, 'read')
    this.aclAgent.allow(this.webId, 'control')
    this.aclAgent.allow(this.webId, 'write')
    let indexUri = Util.getIndexUri()

    if (this.state.currActiveViewBtn === 'visOnlyMe') {
      this.state.viewAllowList.map(el => {
        this.aclAgent.allow(el.label, 'read')
        if (el.canEdit) {
          this.aclAgent.allow(el.label, 'write')
        }
      })
    } else if (this.state.currActiveViewBtn === 'visFriends') {
      this.state.friendViewAllowList.map(el => {
        this.aclAgent.allow(el.name, 'read')
        if (el.canEdit) {
          this.aclAgent.allow(el.name, 'write')
        }
      })
    } else if (this.state.currActiveViewBtn === 'visEveryone') {
      this.aclAgent.allow('*', 'read')
      if (this.state.currActiveEditBtn === 'editOnlyMe') {
        this.state.editAllowList.forEach(el => {
          this.aclAgent.allow(el.label, 'write')
        })
      } else if (this.state.currActiveEditBtn === 'editFriends') {
        this.state.friendViewAllowList.forEach(el => {
          this.aclAgent.allow(el.name, 'write')
        })
      } else if (this.state.currActiveEditBtn === 'editEveryone') {
        this.aclAgent.allow('*', 'write')
      }
    }
    // TODO, rethink a bit.
    this.gAgent.fetchTriplesAtUri(indexUri).then(res => {
      let indexWriter = new Writer()
      res.triples.map(el => {
        if (el.object.uri !== this.aclAgent.uri) {
          indexWriter.addTriple(el)
        }
      })
      this.aclAgent.Writer.find(undefined, undefined, undefined).map(result => {
        if (result.predicate.uri === PRED.mode.uri) {
          if (result.object.uri === PRED.read.uri) {
            this.aclAgent.Writer.find(result.subject, PRED.agent, undefined)
            .map(each => {
              indexWriter.addTriple(
                each.object,
                PRED.readPermission,
                rdf.sym(this.aclAgent.uri)
              )
            })
          } else if (result.object.uri === PRED.write.uri) {
            this.aclAgent.Writer.find(result.subject, PRED.agent, undefined)
            .map(each => {
              indexWriter.addTriple(
                each.object,
                PRED.writePermission,
                rdf.sym(this.aclAgent.uri)
              )
            })
          }
        }
      })
      return fetch(Util.uriToProxied(indexUri), {
        method: 'PUT',
        credentials: 'include',
        body: indexWriter.end(),
        headers: {
          'Content-Type': 'text/turtle'
        }
      }).then((res) => {
        if (!res.ok) {
          throw new Error('Error while putting the file', res)
        }
      }).catch((e) => {
        console.error(e)
      })
    })
  },

  handleCheck(list, user) {
    if (list === 'visOnlyMe') {
      this.state.viewAllowList = this.state.viewAllowList.map(el => {
        if (el === user) {
          el.canEdit = !el.canEdit
        }
        return el
      })
    } else if (list === 'visFriends') {
      this.state.friendViewAllowList = this.state.friendViewAllowList.map(f => {
        if (f === user) {
          f.canEdit = !f.canEdit
        }
        return f
      })
    }
    this.trigger(this.state)
  },

  // TODO TODO Break down, standardize
  fetchInitialData(user) {
    this.init()
    this.aclAgent = new AclAgent(user)
    this.aclAgent.fetchInfo().then((data) => {
      let allowedToRead = this.aclAgent.allAllowedUsers('read')
      this.gAgent.findFriends(this.webId).then(res => {
        // We add all friends to the view list by default
        res.map(el => {
          this.state.friendViewAllowList.push({
            name: el.object.uri,
            canEdit: false
          })
        })
      }).then(() => {
        // Then we check if it is read all
        this.aclAgent.allowedPermissions('*').map(el => {
          if (el === 'read') {
            this.state.currActiveViewBtn = 'visEveryone'
          }
          if (el === 'write') {
            this.state.currActiveEditBtn = 'editEveryone'
          }
        })

        // If it is not vis all, then we check if it is only readable
        // for me, or for everyone.
        if (this.state.currActiveViewBtn !== 'visEveryone') {
          let onlyFriends = true

          // The first one is the webid.
          if (allowedToRead.length === 1) {
            onlyFriends = false
          } else {
            // We get all people who can read the file.
            allowedToRead.map(el => {
              // We ignore the webId in the list
              if (el.uri !== this.webId) {
                // We check, if a person who is allowed to read the file is not
                // in our friend list, therefore the setting is set to
                // "Visible only me" + whitelist
                let flag = this.state.friendViewAllowList.filter(friend => {
                  return friend.name === el.uri
                })
                if (flag.length === 0) {
                  onlyFriends = false
                }
              }
            })
          }
          // only visible to friends, we need to compute who has
          // write access besides read access.
          if (onlyFriends) {
            this.state.currActiveViewBtn = 'visFriends'
            this.state.friendViewAllowList.map(user => {
              if (user.uri !== this.webId) {
                let found = false
                allowedToRead.map(friend => {
                  if (friend.uri === user.name) {
                    found = true
                  }
                })
                if (!found) {
                  this.state.friendViewAllowList =
                  this.state.friendViewAllowList.filter(friend => {
                    return friend.name !== user.name
                  })
                  this.state.friendViewDisallowList.push({
                    label: user.name,
                    key: this.state.friendViewDisallowList.length,
                    canEdit: false
                  })
                }
              }
            })
            this.aclAgent.allAllowedUsers('write').map(user => {
              if (user.uri !== this.webId) {
                this.state.friendViewAllowList.map(friend => {
                  if (friend.name === user.uri) {
                    friend.canEdit = true
                  }
                })
              }
            })
          } else {
            this.state.currActiveViewBtn = 'visOnlyMe'
            allowedToRead.map(user => {
              if (user.uri !== this.webId) {
                this.state.viewAllowList.push({
                  label: user.uri,
                  key: this.state.viewAllowList.length,
                  canEdit: false
                })
              }
            })
            this.aclAgent.allAllowedUsers('write').map(user => {
              if (user.uri !== this.webId) {
                this.state.viewAllowList.map(person => {
                  if (person.label === user.uri) {
                    person.canEdit = true
                  }
                })
              }
            })
          }
        } else {
          if (this.state.currActiveEditBtn === 'editEveryone') {
            return
          }
          // We need to detect if it is editable by me + whitelist or by friends
          let found = false
          let list = []
          this.aclAgent.allAllowedUsers('write').map(user => {
            if (user.uri !== this.webId) {
              this.state.friendViewAllowList.map(friend => {
                if (friend.name === user.uri) {
                  found = true
                }
              })
              list.push(user.uri)
            }
          })
          if (!found) {
            this.state.currActiveEditBtn = 'editOnlyMe'
            list.map(el => {
              this.state.editAllowList.push({
                label: el,
                key: this.state.editAllowList.length,
                canEdit: false
              })
            })
          } else {
            // If it is a friend, but not in the acl, make chip
            this.state.friendViewAllowList.map(friend => {
              let friendFound = false
              this.aclAgent.allAllowedUsers('write').map(el => {
                if (el.uri !== this.webId) {
                  if (el.uri === friend.name) {
                    friendFound = true
                  }
                }
              })
              if (!friendFound) {
                this.state.friendEditDisallowList.push({
                  label: friend.name,
                  key: this.state.friendEditDisallowList.length,
                  canEdit: false
                })
              }
            })
            this.state.currActiveEditBtn = 'editFriends'
          }
        }
      }).then(() => {
        this.trigger(this.state)
      })
    })
  },

  allowRead(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.viewAllowList.push({
      label: user,
      key: this.state.editAllowList.length,
      canEdit: false
    })
    this.trigger(this.state)
  },

  disallowRead(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.viewAllowList = this.state.viewAllowList.filter(el =>
      el.label !== user
    )
    this.trigger(this.state)
  },

  friendAllowRead(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.friendViewAllowList.push({
      name: user,
      canEdit: false
    })

    this.state.friendViewDisallowList =
      this.state.friendViewDisallowList.filter(el => el.label !== user)
    this.trigger(this.state)
  },

  friendDisallowRead(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.friendViewDisallowList.push({
      label: user,
      key: this.state.friendViewDisallowList.length,
      canEdit: false
    })
    this.state.friendViewAllowList = this.state.friendViewAllowList.filter(el =>
      el.name !== user
    )

    this.trigger(this.state)
  },

  allowEdit(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.editAllowList.push({
      label: user,
      key: this.state.editAllowList.length,
      canEdit: false
    })
    this.trigger(this.state)
  },

  disallowEdit(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.editAllowList = this.state.editAllowList.filter(el =>
      el.label !== user
    )
    this.trigger(this.state)
  },

  friendDisallowEdit(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.friendViewAllowList =
    this.state.friendViewAllowList.filter(el => {
      return el.name !== user
    })
    this.state.friendEditDisallowList.push({
      label: user,
      key: this.state.friendEditDisallowList.length,
      canEdit: false
    })
    this.trigger(this.state)
  },

  friendAllowEdit(user) {
    if (user.indexOf('http://') !== 0 &&
        user.indexOf('https://') !== 0) {
      user = `https://${user}`
    }

    this.state.friendEditDisallowList =
      this.state.friendEditDisallowList.filter(el => el.label !== user)
    this.trigger(this.state)
  },

  commit() {
    this.aclAgent.commit()
    // this.aclAgent.commitIndex()
  }
})
