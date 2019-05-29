import {createStore, applyMiddleware, Action} from 'redux'
import thunk, {ThunkDispatch as OriginalThunkDispatch, ThunkAction as OriginalThunkAction} from 'redux-thunk'
import { RootState, rootReducer } from 'src/reducers'
import { BackendMiddleware } from 'src/backendMiddleware'
import config from 'src/config'
import { Store } from 'react-redux'

export function initStore(): Store<{}> {
  const {
    createReactNavigationReduxMiddleware,
  } = require('react-navigation-redux-helpers')

  createReactNavigationReduxMiddleware(
    'root',
    (state: RootState) => state.navigation,
  )
  const backendMiddleware = new BackendMiddleware(config)

  return createStore(
    rootReducer,
    {},
    applyMiddleware(thunk.withExtraArgument(backendMiddleware)),
  )
}

export type ThunkDispatch = OriginalThunkDispatch<RootState, BackendMiddleware, Action>
export type ThunkAction = OriginalThunkAction<void, RootState, BackendMiddleware, Action>
