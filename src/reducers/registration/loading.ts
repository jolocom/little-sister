import { AnyAction } from 'redux'
import { LoadingState } from 'src/reducers/registration/'

const initialState: LoadingState = {
  loadingMsg: 'Loading',
}

export const loading = (
  state = initialState,
  action: AnyAction,
): LoadingState => {
  switch (action.type) {
    case 'SET_LOADING_MSG':
      return {
        loadingMsg: action.value
      }
    default:
      return state
  }
}
