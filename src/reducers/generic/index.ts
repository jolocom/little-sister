import { AnyAction } from 'redux'
import { pickBy } from 'ramda'

export const APPWRAP_UPDATE_CONFIG = 'APPWRAP_UPDATE_CONFIG'
export const APPWRAP_SHOW_LOADER = 'APPWRAP_SHOW_LOADER'
export const APPWRAP_REGISTER_CONFIG = 'APPWRAP_REGISTER_CONFIG'
export const APPWRAP_UNREGISTER_CONFIG = 'APPWRAP_UNREGISTER_CONFIG'

export interface AppWrapConfig {
  readonly withoutStatusBar: boolean
  readonly loading: boolean
}
const initialAppWrapAttrs: AppWrapConfig = {
  loading: false,
  withoutStatusBar: false,
}

export const isAppWrapConfigAttr = (key: string) => initialAppWrapAttrs[key] !== undefined
export const pickAppWrapConfigAttrs: (o: any) => AppWrapConfig =
  pickBy((v, k) => isAppWrapConfigAttr(k))

export interface AppWrapState {
  readonly appWrapConfig: AppWrapConfig
  readonly appWrapConfigsSet: AppWrapConfig[]
}
const initialAppWrapState: AppWrapState = {
  appWrapConfig: initialAppWrapAttrs,
  appWrapConfigsSet: []
}

export const appWrapReducer = (
  state = initialAppWrapState,
  action: AnyAction,
): AppWrapState => {
  let appWrapConfig, appWrapConfigsSet
  switch (action.type) {
    case APPWRAP_REGISTER_CONFIG:
      const idx = state.appWrapConfigsSet.indexOf(action.value)
      if (idx > -1 || Object.keys(action.value).length === 0) return state
      appWrapConfig = {...state.appWrapConfig, ...action.value }
      appWrapConfigsSet = [...state.appWrapConfigsSet, action.value]
      console.log('REGISTER', action.value, appWrapConfig)
      return { appWrapConfig, appWrapConfigsSet }
    case APPWRAP_UNREGISTER_CONFIG:
      const idx2 = state.appWrapConfigsSet.indexOf(action.value)
      if (idx2 < 0) return state
      appWrapConfigsSet = state.appWrapConfigsSet.filter(s => s !== action.value)
      appWrapConfig = appWrapConfigsSet.reduce((prev, cur) => ({...prev, ...cur}), initialAppWrapAttrs)
      console.log('UNREGISTER', idx2, action.value, appWrapConfig)
      return { appWrapConfig, appWrapConfigsSet }

    case APPWRAP_SHOW_LOADER:
      return {...state, appWrapConfig: {...state.appWrapConfig, loading: action.value} }
    default:
      return state
  }
}
