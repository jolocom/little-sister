import { AnyAction } from 'redux'
import { pickBy } from 'ramda'

export const APPWRAP_UPDATE_CONFIG = 'APPWRAP_UPDATE_CONFIG'
export const APPWRAP_SHOW_LOADER = 'APPWRAP_SHOW_LOADER'
export const APPWRAP_REGISTER_CONFIG = 'APPWRAP_REGISTER_CONFIG'
export const APPWRAP_UNREGISTER_CONFIG = 'APPWRAP_UNREGISTER_CONFIG'
export const APPWRAP_SET_LOCKED = 'APPWRAP_SET_LOCKED'
export const APPWRAP_SET_DISABLE_LOCK = 'APPWRAP_SET_DISABLE_LOCK'

export interface AppWrapConfig {
  readonly withoutStatusBar: boolean
  readonly loading: boolean
  readonly dark: boolean
  readonly secondaryDark: boolean
}
const initialAppWrapAttrs: AppWrapConfig = {
  loading: false,
  withoutStatusBar: false,
  dark: false,
  secondaryDark: false,
}

export const isAppWrapConfigAttr = (key: string) => initialAppWrapAttrs[key] !== undefined
export const pickAppWrapConfigAttrs: (o: any) => AppWrapConfig =
  pickBy((v, k) => isAppWrapConfigAttr(k))

export interface AppWrapState {
  readonly locked: boolean
  readonly disableLock: boolean
  readonly appWrapConfig: AppWrapConfig
  readonly appWrapConfigsSet: AppWrapConfig[]
}
const initialAppWrapState: AppWrapState = {
  locked: false,
  disableLock: false,
  appWrapConfig: initialAppWrapAttrs,
  appWrapConfigsSet: []
}

// TODO(mnzaki): this code is unnecessarily complicated
// the complicated "ConfigsSet" keeping is to support nested <Wrapper>
// components
// - but we don't really need to support them
// - see 20APR[RN61.5] on notion.so:spaces/mnzaki

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
      return { ...state, appWrapConfig, appWrapConfigsSet }
    case APPWRAP_UNREGISTER_CONFIG:
      const idx2 = state.appWrapConfigsSet.indexOf(action.value)
      if (idx2 < 0) return state
      appWrapConfigsSet = state.appWrapConfigsSet.filter(s => s !== action.value)
      appWrapConfig = appWrapConfigsSet.reduce((prev, cur) => ({...prev, ...cur}), initialAppWrapAttrs)
      return { ...state, appWrapConfig, appWrapConfigsSet }

    case APPWRAP_SHOW_LOADER:
      return {...state, appWrapConfig: {...state.appWrapConfig, loading: action.value} }
    case APPWRAP_SET_LOCKED:
      return { ...state, locked: action.value }

    case APPWRAP_SET_DISABLE_LOCK:
      return { ...state, disableLock: action.value }
    default:
      return state
  }
}
