import { createStore, applyMiddleware, AnyAction } from 'redux'
import thunk from 'redux-thunk'
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

export type All = {[key: string]: any} | ThunkAction | NavigationAction | Modifier

export type Modifier = (dispatch: ThunkDispatch) => Promise<All>

export interface ThunkDispatch {
  <T extends AnyAction | NavigationAction>(action: T): T
  <R extends ThunkAction | Modifier | ((...args: any[]) => any)>(
    asyncAction: R,
  ): ReturnType<R>
  <S extends All>(anyAction: S): S
}
export interface ThunkAction {
  <A extends All>(
    dispatch: ThunkDispatch,
    getState: () => RootState,
    extraArgument: BackendMiddleware,
  ): A
}
