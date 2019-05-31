import {
  NavigationActions,
  NavigationNavigateAction,
  NavigationNavigateActionPayload,
  NavigationResetAction,
} from 'react-navigation'
import { toggleDeepLinkFlag } from '../sso'
import { routeList } from 'src/routeList'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from '../../lib/storage/interactionTokens'
import { AsyncThunkAction } from '../../store'
import { showErrorScreen } from '../generic'
import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'

export const navigate = (options: NavigationNavigateActionPayload) =>
  NavigationActions.navigate(options)

export const goBack = () => NavigationActions.back()

export const navigatorReset = (
  newScreen: NavigationNavigateActionPayload,
): NavigationResetAction =>
  NavigationActions.reset({
    index: 0,
    actions: [navigate(newScreen)],
  })

/**
 * The function that parses a deep link to get the route name and params
 * It then matches the route name and dispatches a corresponding action
 * @param url - a deep link string with the following schema: appName://routeName/params
 */
export const handleDeepLink = (
  url: string,
):    AsyncThunkAction<NavigationResetAction | NavigationNavigateAction> => async (
      dispatch,
      getState,
      backendMiddleware,
    ) => {
      // TODO Fix
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
          return dispatch(navigatorReset({ routeName: routeList.Landing }))
        }

        dispatch(toggleDeepLinkFlag(true))
        const interactionToken = JolocomLib.parse.interactionToken.fromJWT(params)
        const handler: (arg: JSONWebToken<JWTEncodable>) => AsyncThunkAction<any> =
          interactionHandlers[interactionToken.interactionType]

    // TODO What if absent?
    if (handler) {
      return dispatch(handler(interactionToken))
    }

    /** @TODO Use error code */
    return dispatch(showErrorScreen(new Error('No handler found')))
  }

  /** @TODO Better return */
  return navigate({
    routeName: routeList.Home,
  })
}
