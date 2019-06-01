import {
  createStore,
  applyMiddleware,
  ActionCreator,
  AnyAction,
} from 'redux'
import thunk, { ThunkDispatch as OriginalThunkDispatch } from 'redux-thunk'
import { RootState, rootReducer } from 'src/reducers'
import { BackendMiddleware } from 'src/backendMiddleware'
import config from 'src/config'
import { Store } from 'react-redux'
import { NavigationAction } from 'react-navigation'

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

export type All =  AnyAction | ThunkAction | NavigationAction

export type ThunkDispatch = OriginalThunkDispatch<
  RootState,
  BackendMiddleware,
  //@ts-ignore TODO Can this be solved?
  All
>

export interface ThunkAction {
  <A extends All>(
    dispatch: ThunkDispatch,
    getState: () => RootState,
    extraArgument: BackendMiddleware,
  ): A | Promise<A>
}

export const withLoading = (loadingAction: ActionCreator<All>) => (
  wrappedAction: All,
) => (dispatch: ThunkDispatch) => {
  dispatch(loadingAction(true))
  return Promise.resolve(dispatch(wrappedAction)).finally(() =>
    dispatch(loadingAction(false)),
  )
}

export const withErrorHandling = (
  errorHandler: (err: Error) => AnyAction,
) => (wrappedAction: All) => (dispatch: ThunkDispatch) => {
  return Promise.resolve(dispatch(wrappedAction)).catch((err: Error) =>
    dispatch(errorHandler(err)),
  )
}

