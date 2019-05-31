import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import SplashScreen from 'react-native-splash-screen'
import I18n from 'src/locales/i18n'
import { ThunkAction } from '../../store'
import { NavigationNavigateAction } from 'react-navigation'

export const showErrorScreen = (
  error: Error,
  returnTo = routeList.Home,
): ThunkAction<NavigationNavigateAction> => dispatch =>
  navigationActions.navigate({
    routeName: routeList.Exception,
    params: { returnTo, error },
  })

export const initApp = (): ThunkAction => async (
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

    dispatch(loadSettings(storedSettings))
    SplashScreen.hide()
  } catch (e) {
    dispatch(showErrorScreen(e, routeList.Landing))
  }
}

export const loadSettings = (settings: { [key: string]: any }) => ({
  type: 'LOAD_SETTINGS',
  value: settings,
})

export const setLocale = (locale: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting('locale', locale)
  I18n.locale = locale
  dispatch({
    type: 'SET_LOCALE',
    value: locale,
  })
}
