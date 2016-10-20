import Reflux from 'reflux'
import Account from 'actions/account'
import {proxy} from 'settings'
import GraphAgent from 'lib/agents/graph'
import WebIdAgent from 'lib/agents/webid'
import rdf from 'rdflib'
import {PRED} from 'lib/namespaces'
import SnackbarActions from 'actions/snackbar'

export default Reflux.createStore({
  listenables: Account,

  state: {
    loggingIn: true
  },

  getInitialState() {
    return this.state
  },

  onSignup(data) {
    localStorage.setItem('jolocom.auth-mode', 'proxy')

    let user = encodeURIComponent(data.username)
    let pass = encodeURIComponent(data.password)
    let name = data.name
    let email = encodeURIComponent(data.email)

    fetch(`${proxy}/register`, {
      method: 'POST',
      body: `username=${user}&password=${pass}&email=${email}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    })
    .then((res) => {
      if (res.status === 400) {
        throw new Error('USERNAME_TAKEN')
      }
      res.json().then((js) => {
        if (name || email) {
          let payload = {name, email}
          Account.login(data.username, data.password, payload)
        } else {
          Account.login(data.username, data.password)
        }
      })
    })
    .catch((e) => {
      if (e.message === 'USERNAME_TAKEN') {
        SnackbarActions.showMessage('Username is already taken.')
      } else {
        SnackbarActions.showMessage('An account error has occured.')
      }
    })
  },

  /* @summary in case the user specified a name / email when registering,
   * we update his already created profile with the data he introduced.
   * @param {string} name - the name we update the profile with.
   * @param {string} email - the email we update the profile with.
   */

  onSetNameEmail(webid, name, email) {
    let gAgent = new GraphAgent()
    let triples = []
    if (name) {
      triples.push({
        subject: rdf.sym(webid),
        predicate: PRED.givenName,
        object: name
      })
    }

    if (email) {
      triples.push({
        subject: rdf.sym(webid),
        predicate: PRED.email,
        // Keep an eye on this.
        object: rdf.sym(`mailto:${email}`)
      })
    }

    return gAgent.writeTriples(webid, triples, false)
  },

  /* @summary logs a user in. In case there's a updatePayload, first
   * applies the update and then logs the user.
   * @param {string} username
   * @param {string} password
   * @param {object} updatePayload - contains the name / email of a newly
   * created user. Only used when registering a new user.
  */

  onLogin(username, password, updatePayload) {
    const webId = localStorage.getItem('jolocom.webId')
    if (webId) {
      this.trigger({loggingIn: true})

      // Check if the cookie is still valid
      fetch(`${proxy}/proxy?url=${webId}`, {
        // using PATCH until HEAD is supported server-side; GET is too costly
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/sparql-update'
        }
      }).then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        Account.login.completed(
          localStorage.getItem('jolocom.username'),
          localStorage.getItem('jolocom.webId')
        )
      }).catch(() => {
        Account.logout()
      })
    } else if (username && password) {
      this.trigger({loggingIn: true})

      let user = encodeURIComponent(username)
      let pass = encodeURIComponent(password)

      fetch(`${proxy}/login`, {
        method: 'POST',
        body: `username=${user}&password=${pass}`,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then((res) => {
        if (!res.ok) {
          throw new Error('Login authentication failed.')
        }

        res.json().then((js) => {
          if (updatePayload) {
            this.onSetNameEmail(
              js.webid, updatePayload.name, updatePayload.email
            ).then(() => {
              Account.login.completed(username, js.webid)
            }).then(() => {
              const webIdAgent = new WebIdAgent()
              webIdAgent.initInbox(js.webid)
              webIdAgent.initIndex(js.webid)
              webIdAgent.initDisclaimer(js.webid)
            })
          } else {
            Account.login.completed(username, js.webid)
          }
        })
      }).catch((e) => {
        SnackbarActions.showMessage('Login authentication failed.')
      })
    } else {
      this.trigger({loggingIn: false})
    }
  },

  onLoginCompleted(username, webId) {
    localStorage.setItem('jolocom.auth-mode', 'proxy')
    localStorage.setItem('jolocom.username', username)
    localStorage.setItem('jolocom.webId', webId)

    this.state = {
      loggingIn: false,
      username: username,
      webId: webId
    }

    this.trigger(this.state)
  },

  onLogout() {
    const authMode = localStorage.getItem('jolocom.auth-mode')

    if (authMode === 'proxy') {
      fetch(`${proxy}/logout`, {
        method: 'POST',
        credentials: 'include',
        // Not sure if the headers are necessary.
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
    }

    this.state = {
      loggingIn: false,
      username: null
    }

    localStorage.removeItem('jolocom.username')
    localStorage.removeItem('jolocom.webId')
    localStorage.removeItem('jolocom.auth-mode')

    this.trigger(this.state)
  },

  loggedIn() {
    // How would this work now?
    return localStorage.getItem('jolocom.webId')
  }
})
