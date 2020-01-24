import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import SplashScreen from 'react-native-splash-screen'
import I18n from 'src/locales/i18n'
import { ThunkAction } from 'src/store'
import { AppError, ErrorCode } from 'src/lib/errors'
import settingKeys from '../../ui/settings/settingKeys'
import { SETTINGS } from '../../reducers/settings'

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

export const initApp: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  try {
    await backendMiddleware.initStorage()
    const storedSettings = await backendMiddleware.storageLib.get.settingsObject()
    // locale setup
    if (storedSettings.locale) I18n.locale = storedSettings.locale
    else storedSettings.locale = I18n.locale
    SplashScreen.hide()
    return dispatch(loadSettings(storedSettings))
  } catch (e) {
    return dispatch(
      showErrorScreen(
        new AppError(ErrorCode.WalletInitFailed, e, routeList.Landing),
      ),
    )
  }
}

export const loadSettings = (settings: { [key: string]: any }) => ({
  type: SETTINGS.LOAD_SETTINGS,
  value: settings,
})

export const setLocale = (locale: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting(settingKeys.locale, locale)
  I18n.locale = locale
  dispatch({ type: SETTINGS.SET_LOCALE, value: locale })

  // we need to reset the navigator so that all screens are re-rendered with the
  // new locale
  return dispatch(navigationActions.navigatorReset())
}
