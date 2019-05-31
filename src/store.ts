import {
  createStore,
  applyMiddleware,
  ActionCreator,
  AnyAction as SimpleAction,
  AnyAction,
  Action,
} from 'redux'
import thunk from 'redux-thunk'
import { RootState, rootReducer } from 'src/reducers'
import { BackendMiddleware } from 'src/backendMiddleware'
import config from 'src/config'
import { Store } from 'react-redux'
import { NavigationActions } from 'react-navigation'

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

// export type ThunkAction<R, S, E, A extends Action> = (
//   dispatch: ThunkDispatch<S, E, A>,
//   getState: () => S,
//   extraArgument: E
// ) => R;

// export type AsyncThunkAction<R> = ThunkAction<Promise<R>>
// export type AnyThunkAction<R> = ThunkAction<R> | AsyncThunkAction<R>
// export type ThunkDispatch<R> = (action: AnyAction<R>) => R

// export type ThunkDispatch = <R>(action: AnyThunkAction<R> | Action) => R

export type ThunkAction<R> = (
  dispatch: ThunkDispatch<R>,
  getState: () => RootState,
  extraArgument: BackendMiddleware,
) => R

export interface ThunkDispatch<R> {
  <T extends SimpleAction>(action: T): T
  <R>(asyncAction: ThunkAction<R>): R
}

/**
 * @TODO move to util
 * @TODO type on loading action arguments (bool)
 */

// export type AnyAction<R = void> = ThunkAction<R> | Action<R>

export interface ActionCreator<A> {
  (...args: any[]): A
}
type ActionCr = <A>(...args: any[]) => A
//
// export const withLoading = <R, S>(loadingAction: ActionCreator<S>) => (
//   wrappedAction: ThunkAction<R> | AnyAction,
// ) => (dispatch: ThunkDispatch<R>) => {
//   dispatch(loadingAction(true))
//   return dispatch(wrappedAction).finally(() => dispatch(loadingAction(false)))
// }

export function withLoading<R, S>(
  loadingAction: ActionCreator<S> | ActionCreator<ThunkAction<S>>,
) {
  return function(wrappedAction: ThunkAction<R>): ThunkAction<Promise<R>> {
    return function(dispatch) {
      dispatch(loadingAction(true))
      return Promise.resolve(dispatch(wrappedAction)).finally(() =>
        dispatch(loadingAction(false)),
      )
    }
  }
}

export const withErrorHandlingAsync = <S, R>(
  errorHandler: (err: Error) => AnyThunkAction<S>,
) => (wrappedAction: AsyncThunkAction<R>) => (dispatch: ThunkDispatch) => {
  return dispatch(wrappedAction).catch((err: Error) =>
    dispatch(errorHandler(err)),
  )
}

export const withErrorHandlingSync = <S, R>(
  errorHandler: (err: Error) => AnyThunkAction<S>,
) => (wrappedAction: AnyThunkAction<R>) => (dispatch: ThunkDispatch) => {
  try {
    return dispatch(wrappedAction)
  } catch (e) {
    return dispatch(errorHandler(e))
  }
}

export const withErrorHandling = <R>(
  errorHandler: (err: Error) => AnyThunkAction<S> | Action<R>,
) => (wrappedAction: AsyncThunkAction<R>) => (dispatch: ThunkDispatch) => {
  return dispatch(wrappedAction).catch((err: Error) =>
    dispatch(errorHandler(err)),
  )
}
