import { ActionCreator } from 'redux'
import { All, ThunkDispatch } from '../store'
import {AppError} from '../lib/errors'

export const withLoading = (
  loadingAction: ActionCreator<All>,
) => <R extends All>(wrappedAction: R) => {
  return async function(dispatch: ThunkDispatch) {
    dispatch(loadingAction(true))
    await dispatch(wrappedAction)
    return dispatch(loadingAction(false))
  }
}

export const withErrorHandling = (
  errorHandler: (err: AppError) => All,
  errorModifier: (err: AppError) => AppError = (err: AppError) => err
) => <
  R extends All
>(
  wrappedAction: R,
) => {
  return async function(dispatch: ThunkDispatch) {
    try {
      return await dispatch(wrappedAction)
    } catch (err) {
      return dispatch(errorHandler(errorModifier(err)))
    }
  }
}
