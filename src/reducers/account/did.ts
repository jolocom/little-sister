import { AnyAction } from 'redux'
import { DidState } from 'src/reducers/account/'

const initialState: DidState = {
  did: '',
}

export const did = (state = initialState, action: AnyAction): DidState => {
  switch (action.type) {
    case 'DID_SET':
      return {
        ...state,
        did: action.value,
      }
    default:
      return state
  }
}
