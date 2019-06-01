import {ActionCreator} from 'redux'
import {All, ThunkAction, ThunkDispatch} from '../store'
//
// export const withLoading = (loadingAction: ActionCreator<All>) => (
//   wrappedAction: All,
// ) => (dispatch: ThunkDispatch) => {
//   dispatch(loadingAction(true))
//   return Promise.resolve(dispatch(wrappedAction)).finally(() =>
//     dispatch(loadingAction(false)),
//   )
// }
//
// export const withErrorHandling = (
//   errorHandler: ActionCreator<All>,
// ) => (wrappedAction: All) => (dispatch: ThunkDispatch) => {
//   return Promise.resolve(dispatch(wrappedAction)).catch((err: Error) =>
//     dispatch(errorHandler(err)),
//   )
// }

export const withLoading = (loadingAction: ActionCreator<All>) => (
  wrappedAction: ThunkAction,
) => async (dispatch: ThunkDispatch) => {
  dispatch(loadingAction(true))
  const result = await dispatch(wrappedAction)
  dispatch(loadingAction(false))
  return result
}

export const withErrorHandling = <H extends ActionCreator<All>, T extends All>(
  errorHandler: H,
) => (wrappedAction: All) => async (dispatch: ThunkDispatch) => {
  try {
    return dispatch(wrappedAction)
  } catch (err) {
    return dispatch(errorHandler(err))
  }
}

