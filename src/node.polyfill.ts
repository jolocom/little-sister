/**
 * This file contains polyfills for various things that are somehow coupled
 * with react-native. This is meant to be used as a polyfill for running the
 * backendMiddleware and redux store under node
 */

function logCall(pref: string) {
  return (msg: string) => console.log(`${pref}: ${msg}`)
}

const BackendMiddleware = require('src/backendMiddleware').BackendMiddleware
const ormconfig = require('../ormconfig.ts').default

// change type to 'sqlite' instead of 'react-native'
ormconfig.type = 'sqlite'
ormconfig.database = 'db.sqlite3'

export function initStore() {
  const { createStore, applyMiddleware } = require('redux')
  const thunk = require('redux-thunk').default
  const { rootReducer } = require('src/reducers')

  const config = require('src/config.ts')
  config.typeOrmConfig = ormconfig

  // instantiate the storage backend
  const backendMiddleware = new BackendMiddleware(config)

  const store = createStore(
    rootReducer,
    {},
    applyMiddleware(thunk.withExtraArgument(backendMiddleware)),
  )

  store.backendMiddleware = backendMiddleware

  return store
}

import { writeFileSync, readFileSync } from 'fs'
import path from 'path'

export class KeyChain {
  static PASSWORD_LOCATION = path.resolve(
    `${__dirname}/../local_identity.password.txt`,
  )
  private pass: string | null = null

  public async getPassword() {
    if (this.pass != null) return this.pass
    try {
      this.pass = readFileSync(KeyChain.PASSWORD_LOCATION)
        .toString()
        .trim()
    } catch (err) {
      console.error('Error reading password file', err, '\n\n')
    }
    return this.pass
  }

  public async savePassword(pass: string) {
    console.log('KEYCHAIN SAVED PASSWORD: ', pass)
    this.pass = pass
    writeFileSync(KeyChain.PASSWORD_LOCATION, pass)
  }
}

export interface KeyChainInterface {
  savePassword: (password: string) => Promise<void>
  getPassword: () => Promise<string>
}

const fetch = require('node-fetch')
const FormData = require('form-data')

export { IpfsStorageAgent as IpfsCustomConnector } from 'node_modules/jolocom-lib/js/ipfs/ipfs'

// default export merge of all default exports
export default {
  // RNFetchBlob default export
  // @ts-ignore
  fetch(method, endpoint, headers, formDataList) {
    console.log(arguments)
    const body = new FormData()
    formDataList.forEach((item: { name: string; data: string }) => {
      body.append(item.name, item.data)
    })
    return fetch(endpoint, { method, body, headers }).then((res: any) => {
      console.log('body', res.body.toString())
      return res
    })
  },

  // src/locales/i18n.ts default export
  t: (str: string) => str,

  // react-native-splash-screen
  hide: logCall('SplashScreen.hide'),
}

const { randomBytes } = require('crypto')
export const generateSecureRandomBytes = async (length: Number) =>
  randomBytes(length)

export class Linking {
  static async canOpenURL(url: string) {
    console.log('canOpenURL called with ' + url)
    return true
  }

  static async openURL(url: string) {
    console.log('openURL called with ' + url)
  }
}

export function findBestAvailableLanguage(locales: string[]) {}
