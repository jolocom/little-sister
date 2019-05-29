import {
  NavigationActions,
  NavigationNavigateActionPayload,
} from 'react-navigation'
import { toggleLoading } from '../account'
import { setDeepLinkLoading, toggleDeepLinkFlag } from '../sso'
import { routeList } from 'src/routeList'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from '../../lib/storage/interactionTokens'
import { ThunkAction } from '../../store'

export const navigate = (options: NavigationNavigateActionPayload) =>
  NavigationActions.navigate(options)

export const goBack = () => NavigationActions.back()

export const navigatorReset = (newScreen: NavigationNavigateActionPayload) =>
  NavigationActions.reset({
    index: 0,
    actions: [navigate(newScreen)],
  })

/**
 * The function that parses a deep link to get the route name and params
 * It then matches the route name and dispatches a corresponding action
 * @param url - a deep link string with the following schema: appName://routeName/params
 */
export const handleDeepLink = (url: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  dispatch(toggleLoading(true))
  const route: string = url.replace(/.*?:\/\//g, '')
  const params: string = (route.match(/\/([^\/]+)\/?$/) as string[])[1] || ''
  const routeName = route.split('/')[0]

  if (
    routeName === 'consent' ||
    routeName === 'payment' ||
    routeName === 'authenticate'
  ) {
    // The identityWallet is initialised before the deep link is handled.
    if (!backendMiddleware.identityWallet) {
      dispatch(toggleLoading(false))
      dispatch(navigatorReset({ routeName: routeList.Landing }))
      return
    }

    dispatch(setDeepLinkLoading(true))
    dispatch(toggleDeepLinkFlag(true))
    const interactionToken = JolocomLib.parse.interactionToken.fromJWT(params)
    const handler = interactionHandlers[interactionToken.interactionType]

    // TODO What if absent?
    if (handler) {
      dispatch(handler(interactionToken))
    }
  }
}
