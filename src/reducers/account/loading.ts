import { AnyAction } from 'redux'

export type LoadingState = boolean
const initialState: LoadingState = false

export const loading = (
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
