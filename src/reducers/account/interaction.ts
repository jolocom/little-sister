import { AnyAction } from 'redux'

export type InteractingState = boolean
const initialState: InteractingState = false

export const interacting = (
  state = initialState,
  action: AnyAction,
): InteractingState => {
  switch (action.type) {
    case 'SET_INTERACTING':
      return action.payload
    default:
      return state
  }
}
