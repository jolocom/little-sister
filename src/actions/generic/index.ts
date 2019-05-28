import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import SplashScreen from 'react-native-splash-screen'
import {ThunkAction} from '../../store'

export const showErrorScreen = (error: Error, returnTo = routeList.Home) => navigationActions.navigate({
    routeName: routeList.Exception,
    params: {returnTo, error}
  })

export const initApp = () : ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  try {
    await backendMiddleware.initStorage()
    SplashScreen.hide()
  } catch (e) {
    dispatch(showErrorScreen(e, routeList.Landing))
  }
}
