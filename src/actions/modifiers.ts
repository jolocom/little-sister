import { ActionCreator } from 'redux'
import { All, ThunkDispatch } from '../store'

export const withLoading = <L extends All>(loadingAction: ActionCreator<L>) => (
  wrappedAction: any,
) => async (dispatch: ThunkDispatch) => {
  dispatch(loadingAction(true))
  return Promise.resolve(dispatch(wrappedAction))
    .then(() => dispatch(loadingAction(false)))
    .finally(() => dispatch(loadingAction(false)))
}

export const withErrorHandling = <H extends ActionCreator<All>, T extends All>(
  errorHandler: H,
) => (wrappedAction: any) => async (dispatch: ThunkDispatch) => {
  return Promise.resolve(dispatch(wrappedAction)).catch(err =>
    dispatch(errorHandler(err)),
  )
}
