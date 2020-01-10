import {
  NavigationActions,
  StackActions,
  NavigationNavigateActionPayload,
  NavigationAction,
  NavigationContainerComponent,
  NavigationRouter,
  NavigationResetActionPayload,
  NavigationNavigateAction,
  NavigationState,
  NavigationRoute,
  NavigationScreenProp,
} from 'react-navigation'
import { routeList } from 'src/routeList'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from 'src/lib/storage/interactionTokens'
import { AppError, ErrorCode } from 'src/lib/errors'
import { withLoading, withErrorScreen } from 'src/actions/modifiers'
import { ThunkAction, ThunkDispatch } from 'src/store'
import { setActiveNotificationFilter } from '../notifications'
import { NotificationFilter } from '../../lib/notifications'
import { store as ReduxStore } from '../../App'

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
 * @param state: current state (for nested routes) of the navigator
 * @returns navigationOptions for the current state
 */
const getNavigationOptionsFromState = (
  state: NavigationState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  // @ts-ignore
  let navi = navigator._navigation
  let curState: NavigationState | NavigationRoute = state,
    navigationOptions

  while (curState.routes) {
    curState = curState.routes[curState.index]
    const childNavi = navi.getChildNavigation(curState.key)
    navigationOptions = navi.router.getScreenOptions(childNavi)
    navi = childNavi
  }

  return navigationOptions
}

/**
 * NOTE: navigate and navigatorReset both dispatch the navigation actions but
 * the actions are not handled by our reducers. Dispatching is useful for testing
 * (comparing snapshots of store actions) and it makes typescript happy
 */
export const navigate = (
  options: NavigationNavigateActionPayload,
): ThunkAction => async dispatch => {
  const action = NavigationActions.navigate(options)

  dispatchNavigationAction(action)
  await dispatch(action)

  // @ts-ignore
  const { state } = navigator._navigation
  const navigationOptions = getNavigationOptionsFromState(state)

  if (navigationOptions.notifications) {
    dispatch(setActiveNotificationFilter(navigationOptions.notifications))
  }
}

export const handleBackAction = (
  state: NavigationState,
): ThunkAction => async dispatch => {
  const navigationOptions = getNavigationOptionsFromState(state)

  if (navigationOptions.notifications) {
    dispatch(setActiveNotificationFilter(navigationOptions.notifications))
  }
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

// NOTE: should this be in actions???
export const bottomTabPressHandler = (filter: NotificationFilter) => (options: {
  navigation: NavigationScreenProp<NavigationRoute> & {
    emit: (event: string) => void
  }
}) => {
  const thunkDispatch = ReduxStore.dispatch as ThunkDispatch
  const { navigation } = options
  const route = navigation.state
  const isNestedRoute = route.hasOwnProperty('index') && route.index > 0

  if (navigation.isFocused()) {
    if (isNestedRoute) {
      // NOTE: if there are nested routes inside the tab navigator, they are
      // not handled by our navigationActions
      navigation.dispatch(StackActions.popToTop({ key: route.key }))
    } else {
      // NOTE: not properly typed
      navigation.emit('refocus')
    }
    thunkDispatch(setActiveNotificationFilter(filter))
  } else {
    thunkDispatch(navigate({ routeName: navigation.state.routeName }))
  }
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
  // TODO Fix
  const route: string = url.replace(/.*?:\/\//g, '')
  const params: string = (route.match(/\/([^\/]+)\/?$/) as string[])[1] || ''
  const routeName = route.split('/')[0]

  // The identityWallet is initialised before the deep link is handled. If it
  // is not initialized, then we may not even have an identity.
  if (!backendMiddleware.identityWallet) {
    return dispatch(
      navigate({
        routeName: routeList.Landing,
      }),
    )
  }

  const supportedRoutes = ['consent', 'payment', 'authenticate']
  if (supportedRoutes.includes(routeName)) {
    const interactionToken = JolocomLib.parse.interactionToken.fromJWT(params)
    const handler = interactionHandlers[interactionToken.interactionType]

    if (handler) {
      return dispatch(
        withLoading(withErrorScreen(handler(interactionToken, true))),
      )
    }
  }

  /** @TODO Use error code */
  throw new AppError(
    ErrorCode.ParseJWTFailed,
    new Error('Could not handle interaction token'),
  )
}
