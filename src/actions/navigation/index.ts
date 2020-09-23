import {
  NavigationAction,
  NavigationActions,
  NavigationContainerComponent,
  NavigationNavigateAction,
  NavigationNavigateActionPayload,
  NavigationResetActionPayload,
  NavigationRouter,
  StackActions,
} from 'react-navigation'
import { routeList } from 'src/routeList'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from 'src/lib/interactionHandlers'
import { AppError, ErrorCode } from '../../lib/errors'
import { withErrorScreen, withLoading } from 'src/actions/modifiers'
import { ThunkAction } from 'src/store'
import { InteractionTransportType } from '@jolocom/sdk/js/src/lib/interactionManager/types'
import { setInteracting } from '../account'

const deferredNavActions: NavigationAction[] = []
let dispatchNavigationAction = (action: NavigationAction) => {
    deferredNavActions.push(action)
  },
  navigator: NavigationContainerComponent

export const setTopLevelNavigator = (nav: NavigationContainerComponent) => {
  dispatchNavigationAction = nav.dispatch.bind(nav)
  navigator = nav
  deferredNavActions.forEach(dispatchNavigationAction)
  deferredNavActions.length = 0
}

/**
 * NOTE: navigate and navigatorReset both dispatch the navigation actions but
 * the actions are not handled by our reducers. Dispatching is useful for testing
 * (comparing snapshots of store actions) and it makes typescript happy
 */
export const navigate = (
  options: NavigationNavigateActionPayload
): ThunkAction => dispatch => {
  const action = NavigationActions.navigate(options)

  dispatchNavigationAction(action)
  return dispatch(action)
}

export const navigateBack = (): ThunkAction => dispatch => {
  const action = NavigationActions.back()
  dispatchNavigationAction(action)
  return dispatch(action)
}

export const navigateBackHome = (): ThunkAction => dispatch => {
  dispatch(navigateBack())
  return dispatch(navigatorResetHome())
}

export const navigatorReset = (
  newScreen?: NavigationNavigateActionPayload,
): ThunkAction => dispatch => {
  const resetActionPayload: NavigationResetActionPayload = {
    index: 0,
    actions: [],
  }

  if (newScreen) {
    resetActionPayload.actions.push(NavigationActions.navigate(newScreen))
  } else {
    // @ts-ignore
    const navState = navigator.state.nav
    // @ts-ignore
    const navRouter: NavigationRouter = navigator._navigation.router

    if (navRouter) {
      const { path, params } = navRouter.getPathAndParamsForState(navState)
      const action = navRouter.getActionForPathAndParams(
        path,
        params,
      ) as NavigationNavigateAction

      // getActionForPathAndParams is typed to potentially return null, but we are
      // using it on the current state itself, so this should "never" happen
      if (!action) {
        throw new Error('impossible')
      }

      if (action.action) {
        // since the top level router is a SwitchRouter,
        // the first action will be to navigate to MainStack, but we are using a
        // StackReset action which will be caught by MainStack, so we can just pass
        // in the nested Navigate action
        resetActionPayload.actions.push(action.action)
      }
    }
  }

  const resetAction = StackActions.reset(resetActionPayload)
  dispatchNavigationAction(resetAction)
  return dispatch(resetAction)
}

export const navigatorResetHome = (): ThunkAction => dispatch =>
  dispatch(navigatorReset({ routeName: routeList.Home }))

/**
 * The function that parses a deep link to get the route name and params
 * It then matches the route name and dispatches a corresponding action
 * @param url - a deep link string with the following schema: appName://routeName/params
 */
export const handleDeepLink = (url: string): ThunkAction => (
  dispatch,
  getState,
  backendMiddleware,
) => {
  // The identityWallet is initialised before the deep link is handled. If it
  // is not initialized, then we may not even have an identity.
  if (!backendMiddleware.identityWallet) {
    return dispatch(
      navigate({
        routeName: routeList.Landing,
      }),
    )
  }

  let routeName = '',
    params = ''

  if (url) {
    const [scheme, uri] = url.split('://')
    if (scheme && uri) {
      const parts = uri.split('/')
      if (scheme.startsWith('http')) {
        routeName = parts[1]
        params = parts[2]
      } else {
        routeName = parts[0]
        params = parts[1]
      }
    }
  }

  const supportedRoutes = ['consent', 'authenticate']
  if (supportedRoutes.includes(routeName)) {
    const interactionToken = JolocomLib.parse.interactionToken.fromJWT(params)
    const handler = interactionHandlers[interactionToken.interactionType]

    if (handler) {
      dispatch(setInteracting(true))
      return dispatch(
        withLoading(
          withErrorScreen(
            handler(interactionToken, InteractionTransportType.Deeplink),
          ),
        ),
      )
    }
  }

  /** @TODO Use error code */
  throw new AppError(
    ErrorCode.ParseJWTFailed,
    new Error('Could not handle interaction token'),
  )
}
