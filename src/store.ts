import { createStore, applyMiddleware, Action, ActionCreator } from 'redux'
import thunk, { ThunkAction as OriginalThunkAction } from 'redux-thunk'
import { RootState, rootReducer } from 'src/reducers'
import { BackendMiddleware } from 'src/backendMiddleware'
import config from 'src/config'
import { Store } from 'react-redux'
import {accountActions} from './actions'
import {showErrorScreen} from './actions/generic'
import {compose} from 'ramda'

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

export type ThunkAction<R = void> = OriginalThunkAction<
  R,
  RootState,
  BackendMiddleware,
  Action
>
export type AsyncThunkAction<R = void> = ThunkAction<Promise<R>>
export type AnyThunkAction<R = void> = ThunkAction<R> | AsyncThunkAction<R>
export type AnyAction<R = void> = AnyThunkAction<R> | Action
export type ThunkDispatch = <R = void>(action: AnyAction<R>) => R

/**
 * @TODO move to util
 * @TODO type on loading action arguments (bool)
 */

export const withLoading = <T, R = void>(loadingAction: ActionCreator<Action>) => (
  wrappedAction: AsyncThunkAction<R>,
) => (dispatch: ThunkDispatch) => {
  dispatch(loadingAction(true))
  return dispatch(wrappedAction).finally(() => dispatch(loadingAction(false)))
}

export const withErrorHandlingAsync = <R = void>(
  errorHandler: (err: Error) => AnyAction,
) => (wrappedAction: AsyncThunkAction<R>) => (dispatch: ThunkDispatch) => {
  return dispatch(wrappedAction).catch(errorHandler)
}

export const withErrorHandlingSync = <R = void>(
  errorHandler: (err: Error) => AnyAction<R>,
) => (wrappedAction: ThunkAction | Action) => (dispatch: ThunkDispatch) => {
  try {
    return dispatch(wrappedAction)
  } catch (e) {
    return dispatch(errorHandler(e))
  }
}

export const test = (action: AsyncThunkAction, dispatch: ThunkDispatch) =>
  dispatch(compose(
    withErrorHandlingAsync(showErrorScreen),
    withLoading(accountActions.toggleLoading)
  )(action))
