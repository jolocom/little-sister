import { Linking } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { AppError, ErrorCode } from 'src/lib/errors'
import I18n from 'src/locales/i18n'
import { routeList } from 'src/routeList'
import { navigationActions, accountActions } from 'src/actions'
import { ThunkAction } from 'src/store'
import settingKeys from 'src/ui/settings/settingKeys'
import { withLoading, withErrorScreen } from '../modifiers'

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

    await dispatch(loadSettings(storedSettings))

    const ret = await dispatch(accountActions.checkIdentityExists)

    // FIXME what happens if no identity and this is a deeplink?
    // navigationActions.handleDeepLink throws NoWallet
    // need to improve this UX

    // FIXME: get rid of these after setting up deepLinking properly using
    // react-navigation
    const handleDeepLink = (url: string) =>
      dispatch(
        withLoading(
          withErrorScreen(navigationActions.handleDeepLink(url)),
        ),
      )
    Linking.addEventListener('url', event => handleDeepLink(event.url))
    await Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url)
    })

    return ret
  } catch (e) {
    return dispatch(
      showErrorScreen(
        new AppError(ErrorCode.WalletInitFailed, e, routeList.Landing),
      ),
    )
  } finally {
    SplashScreen.hide()
  }
}

const loadSettings = (settings: { [key: string]: any }) => ({
  type: 'LOAD_SETTINGS',
  value: settings,
})

export const setLocale = (locale: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting(settingKeys.locale, locale)
  I18n.locale = locale
  dispatch({ type: 'SET_LOCALE', value: locale })

  // we need to reset the navigator so that all screens are re-rendered with the
  // new locale
  return dispatch(navigationActions.navigatorReset())
}
