import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import SplashScreen from 'react-native-splash-screen'
import I18n from 'src/locales/i18n'
import { ThunkDispatch} from '../../store'
import {RootState} from '../../reducers'
import {BackendMiddleware} from '../../backendMiddleware'

export const showErrorScreen = (
  error: Error,
  returnTo = routeList.Home,
) => navigationActions.navigate({
    routeName: routeList.Exception,
    params: { returnTo, error },
  })

export const initApp = async (
  dispatch: ThunkDispatch,
  getState: () => RootState,
  backendMiddleware: BackendMiddleware,
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
    return dispatch(showErrorScreen(e, routeList.Landing))
  }
}

export const loadSettings = (settings: { [key: string]: any }) => ({
  type: 'LOAD_SETTINGS',
  value: settings,
})

export const setLocale = (locale: string) => async (
  dispatch: ThunkDispatch,
  getState: () => RootState,
  backendMiddleware: BackendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting('locale', locale)
  I18n.locale = locale
  return dispatch({
    type: 'SET_LOCALE',
    value: locale,
  })
}
