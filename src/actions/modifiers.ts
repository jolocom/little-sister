import { ActionCreator } from 'redux'
import NetInfo from '@react-native-community/netinfo'
import { ThunkAction } from 'src/store'
import { AppError } from '../lib/errors'
import { showErrorScreen, showAppLoading } from './generic'
import { scheduleNotification } from './notifications'
import { createInfoNotification } from '../lib/notifications'
import I18n from 'src/locales/i18n'
import strings from '../locales/strings'
import { scheduleOfflineNotification } from '.'

/**
 * Curried function that wraps a {@link ThunkAction} with two calls to the provided loadingAction
 * {@link ActionCreator} (called with "true" before the wrapped action is dispatched, and with "false" after)
 * @param loadingAction - An action creator to create the actions to be dispatched before and after the wrappedAction-
 * @param wrappedAction - The thunkAction to be wrapped
 * @example dispatch(withLoading(showAppLoading)(saveClaims))
 */
export const withLoadingHandler = (
  loadingAction: ActionCreator<ThunkAction>,
) => (wrappedAction: ThunkAction): ThunkAction => async dispatch => {
  try {
    dispatch(loadingAction(true))
    return await dispatch(wrappedAction)
  } finally {
    dispatch(loadingAction(false))
  }
}

type ErrorModifier = (error: AppError | Error) => AppError

/**
 * Curried function that wraps a {@link ThunkAction} with the provided error handler to be dispatched on thrown error
 * @param errorHandler - An {@link ActionCreator} to be dispatched with the error if an error is thrown
 * @param errorModifier - An optional modifier for the error which is thrown, is Identity function by default
 * @param wrappedAction - The {@link ThunkAction} to be wrapped. If dispatching it throws an error, the errorhandler will be dispatched
 * @example dispatch(withErrorHandling(showErrorScreen)(saveClaims))
 * @dev The return value from this modifier can be passed to other modifiers, i.e. modifiers can be composed
 * e.g. dispatch(withLoading(showAppLoading)(withErrorHandling(showErrorScreen)(saveClaims)))
 */
export const withErrorHandler = (
  errorHandler: ActionCreator<ThunkAction>,
  errorModifier: ErrorModifier | undefined = undefined,
) => (
  wrappedAction: ThunkAction,
  modifier: ErrorModifier | undefined = undefined,
): ThunkAction => async dispatch => {
  modifier = modifier || errorModifier
  try {
    return await dispatch(wrappedAction)
  } catch (error) {
    if (modifier) error = modifier(error)
    return dispatch(errorHandler(error))
  }
}

/**
 * Curried function that wraps a {@link ThunkAction} with a notification on internet connection absence
 * @param wrappedAction - The thunkAction to be wrapped
 * @example dispatch(withInternet((saveClaims))
 */
export const withInternet = (
  wrappedAction: ThunkAction,
): ThunkAction => async dispatch => {
  const state = await NetInfo.fetch()
  if (!state.isConnected) {
    return dispatch(
      scheduleOfflineNotification(
        strings.PLEASE_CHECK_YOUR_CONNECTION_AND_TRY_AGAIN,
      ),
    )
  }
  return dispatch(wrappedAction)
}

export const withLoading = withLoadingHandler(showAppLoading)
export const withErrorScreen = withErrorHandler(showErrorScreen)
