import {
  NavigationActions,
  NavigationNavigateActionPayload
} from "react-navigation"
import { AnyAction, Dispatch } from "redux"
import { interactionHandlerActions } from "src/actions/"
import { setDid, toggleLoading } from "../account"
import { BackendMiddleware } from "src/backendMiddleware"
import { instantiateIdentityWallet } from "src/lib/util"
import { showErrorScreen } from 'src/actions/generic'

export const navigate = (options: NavigationNavigateActionPayload) => {
  return NavigationActions.navigate(options)
}

export const goBack = () => {
  return NavigationActions.back()
}

export const navigatorReset = (newScreen: NavigationNavigateActionPayload) => {
  return NavigationActions.reset({
    index: 0,
    actions: [navigate(newScreen)]
  })
}

/**
 * The function that parses a deep link to get the route name and params
 * It then matches the route name and dispatches a correcponding action
 * @param url - a deep link string with the following schemat: appName://routeName/params
 */
export const handleDeepLink = (url: string) => {
  return async (
    dispatch: Dispatch<AnyAction>,
    getState: Function,
    backendMiddleware: BackendMiddleware
  ) => {
    dispatch(toggleLoading(true))
    const route: string = url.replace(/.*?:\/\//g, "")
    const params: string = (route.match(/\/([^\/]+)\/?$/) as string[])[1] || ""
    const routeName = route!.split("/")[0]

    if (routeName === 'consent') {
      try {
        const personas = await backendMiddleware.storageLib.get.persona()
        
        if (!personas.length) {
          dispatch(toggleLoading(false))
          return // TODO: better handling here
        }
  
        dispatch(setDid(personas[0].did))
        await instantiateIdentityWallet(backendMiddleware)
        dispatch(interactionHandlerActions.parseJWT(params))
      } catch (err) {
        dispatch(showErrorScreen(new Error('Not able to process request from third party app')))
      }
    }
  }
}
