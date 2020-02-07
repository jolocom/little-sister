import { combineReducers, AnyAction } from 'redux'

export type LoadingState = boolean

export interface GenericState {
  readonly loading: LoadingState
}

const initialState: LoadingState = false

export const loadingReducer = (
  state = initialState,
  action: AnyAction,
): LoadingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return action.value
    default:
      return state
  }
}

export const genericReducer = combineReducers<GenericState>({
  loading: loadingReducer,
})
