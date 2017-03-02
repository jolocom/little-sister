import { createStore as _createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { routerMiddleware } from 'react-router-redux'
import backendMiddleware from './middleware/backend'
import Backend from '../backend'

export default function createStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history)
  const middleware = [
    backendMiddleware(new Backend()),
    reduxRouterMiddleware
  ]

  let finalCreateStore
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    const { persistState } = require('redux-devtools')
    // const DevTools = require('../containers/DevTools/DevTools');
    finalCreateStore = composeWithDevTools(
      applyMiddleware(...middleware),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore)
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore)
  }

  const reducer = require('./reducer').default
  const store = finalCreateStore(reducer, data)

  if (window.__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducer', () => {
      store.replaceReducer(require('./reducer').default)
    })
  }

  return store
}
