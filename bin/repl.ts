const welcomeBanner = `
/****** This code was executed ******/
let store = require('src/store').initStore()
let bmw = store.backendMiddleware
let s = bmw.storageLib
let e = require('src/lib/storage/entities')
let a = require('src/actions')

/****** Cheatsheet ******
 *
 * p = _ // put last return value in global variable p
 * store.dispatch(a.registrationActions.createIdentity(crypto.randomBytes(16)))
 * store.dispatch(a.accountActions.checkIdentityExists)
 * store.getState()
 ***********************/

 Please press [RETURN] for a prompt
`

import tsconfig from '../tsconfig.json'
const compilerOptions = tsconfig.compilerOptions

// @ts-ignore
const baseUrl = compilerOptions.baseUrl || '.'
// @ts-ignore
const paths = compilerOptions.paths || {}
const polyfills = [
  'src/lib/keychain',
  'rn-fetch-blob',
  'src/lib/util',
  'react-native',
  'src/lib/errors/sentry',
  'react-native-localize',
  'src/locales/i18n',
  'react-native-splash-screen',
  'src/lib/ipfs',
]
polyfills.forEach((p: string) => {
  paths[p] = ['src/node.polyfill.ts']
})
paths['typeorm/browser'] = ['node_modules/typeorm']

import { register } from 'tsconfig-paths'

// This will monkey patch node so that imports can support path mapping like
// typescript config does. This is used so that 'typeorm/browser' imports in the
// storage lib code get mapped to 'typeorm' directly (for node usage)
register({
  paths,
  baseUrl,
})

if (process.env.REPL) {
  // if we are running as a REPL

  const { initStore } = require('src/node.polyfill.ts')
  const store = initStore()
  const storage = store.backendMiddleware.storageLib
  const entities = require('src/lib/storage/entities')
  const actions = require('src/actions')

  const replGlobalMerge = (function(gl) {
    return (toMerge: object) => Object.assign(gl, toMerge)
  })(global)

  // assign some useful shortcuts
  replGlobalMerge({
    storage,
    entities,
    bmw: store.backendMiddleware,
    store,
    actions,
    s: storage,
    e: entities,
    a: actions,
  })

  // @ts-ignore
  const connPromise = global.storage.initConnection()
  connPromise.then(() => {
    // this doesn't work, presumably because it's async
    // but the funny thing is console.log(conn) at the end works
    // Yet on the repl there's no conn global.
    //
    // @mnzaki tried capturing the global object in a closure (as function
    // arguments and as a const alias) and it still didn't work
    //
    replGlobalMerge({
      // @ts-ignore
      conn: global.storage.connection,
    })

    // @ts-ignore
    // console.log(conn)

    console.log(welcomeBanner)
  })
}
