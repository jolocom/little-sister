import { AppError, ErrorCode } from '../../lib/errors'
import I18n from '../../locales/i18n'
import { routeList } from '../../routeList'
import { navigationActions } from '../../actions'
import { ThunkAction } from '../../store'
import settingKeys from '../../ui/settings/settingKeys'

import * as Keychain from 'react-native-keychain'
// TODO use the settings items from storage
import AsyncStorage from '@react-native-community/async-storage'
// TODO don't depend on the crypto lib, perhaps use the rust crypto utils?
import crypto from 'crypto'

import { termsOfServiceDE } from 'src/ui/termsAndPrivacy/legalTexts'

import {
  AppWrapConfig,
  APPWRAP_UPDATE_CONFIG,
  APPWRAP_SHOW_LOADER,
  APPWRAP_REGISTER_CONFIG,
  APPWRAP_UNREGISTER_CONFIG,
  APPWRAP_SET_LOCKED,
  APPWRAP_SET_DISABLE_LOCK,
} from '../../reducers/generic'
import { AnyAction } from 'redux'
import { PIN_SERVICE } from 'src/ui/deviceauth/utils/keychainConsts'

// Default delay on the loading state value before it can switch back to 'false'
const DEFAULT_LOADING_LATCH_DELAY_MS = 300

export const showErrorScreen = (
  error: AppError | Error,
): ThunkAction => dispatch => {
  const appError: AppError =
    error.constructor === AppError
      ? (error as AppError)
      : new AppError(ErrorCode.Unknown, error)

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.Exception,
      params: {
        returnTo: appError.navigateTo,
        error: appError,
      },
    }),
  )
}

const hashString = (text: string) => {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex')
}

const TERMS_OF_CONDITIONS_KEY = 'TERMS_OF_CONDITIONS'
export const checkTermsOfService = (
  onSubmit?: () => void,
): ThunkAction => async dispatch => {
  const storageHash = await AsyncStorage.getItem(TERMS_OF_CONDITIONS_KEY)
  const currentHash = hashString(termsOfServiceDE)
  const shouldShowTerms = storageHash !== currentHash

  if (!shouldShowTerms && onSubmit) return onSubmit()
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.TermsOfServiceConsent,
      params: { onSubmit },
    }),
  )
}

export const storeTermsOfService = (): ThunkAction => async () => {
  const termsHash = hashString(termsOfServiceDE)
  return AsyncStorage.setItem(TERMS_OF_CONDITIONS_KEY, termsHash)
}

export const setLocale = (locale: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting(settingKeys.locale, {
    selected: locale
  })

  I18n.locale = locale
  dispatch({ type: 'SET_LOCALE', value: locale })

  // we need to reset the navigator so that all screens are re-rendered with the
  // new locale
  return dispatch(navigationActions.navigatorReset())
}

const setLoading = (value: boolean) => ({
  type: APPWRAP_SHOW_LOADER,
  value,
})

export const setLocked = (value: boolean) => ({
  type: APPWRAP_SET_LOCKED,
  value,
})

export const setDisableLock = (value: boolean) => ({
  type: APPWRAP_SET_DISABLE_LOCK,
  value,
})

export const lockApp = (
): ThunkAction => async (dispatch, getState) => {
  // if the lock is globally disabled, or there is no identity created/loaded
  // yet, then this action has no effect
  const disableLock = getState().generic.disableLock
  const hasIdentity = !!getState().account.did.did
  if (disableLock || !hasIdentity) return

  // otherwise we lock the app, using the appropriate lock screen
  const keychainPin = await Keychain.getGenericPassword({
    service: PIN_SERVICE,
  })
  const lockScreen = keychainPin ? routeList.Lock : routeList.RegisterPIN

  dispatch(setLocked(true))
  return dispatch(navigationActions.navigate({ routeName: lockScreen }))
}

export const unlockApp = (
  pin: string,
  resetNav?: boolean,
): ThunkAction => async dispatch => {
  const keychainPin = await Keychain.getGenericPassword({
    service: PIN_SERVICE,
  })

  if (!keychainPin || keychainPin.password !== pin) throw new Error('wrongPin')

  dispatch(setLocked(false))
  return resetNav
    ? dispatch(navigationActions.navigatorResetHome())
    : dispatch(navigationActions.navigateBack())
}

export const updateAppWrapConfig = (value: AppWrapConfig) => ({
  type: APPWRAP_UPDATE_CONFIG,
  value,
})
export const registerAppWrapConfig = (value: AppWrapConfig & {}) => ({
  type: APPWRAP_REGISTER_CONFIG,
  value,
})
export const unregisterAppWrapConfig = (value: AppWrapConfig) => ({
  type: APPWRAP_UNREGISTER_CONFIG,
  value,
})

export const showAppLoading = (
  shouldShow: boolean,
  latchDelay = DEFAULT_LOADING_LATCH_DELAY_MS,
): ThunkAction => async (dispatch, getState) => {
  const wasShowing = getState().generic.appWrapConfig.loading
  if (shouldShow && !wasShowing) {
    // for setting to "true" we do it immediately and set current state
    const ret = dispatch(setLoading(shouldShow))
    return new Promise<AnyAction>(resolve => {
      setTimeout(() => resolve(ret), latchDelay)
    })
  }

  if (wasShowing && !shouldShow) {
    // for setting to 'false', we delay by the latchDelay amount
    return dispatch(delayedSetLoading(shouldShow, latchDelay))
  }
}

let nextLoadingState = false
let timeout: number | undefined
const delayedSetLoading = (
  value: boolean,
  latchDelay: number,
): ThunkAction => async dispatch => {
  nextLoadingState = value
  if (timeout !== undefined) clearTimeout(timeout)
  timeout = setTimeout(() => {
    dispatch(setLoading(nextLoadingState))
    timeout = undefined
  }, latchDelay)
}
