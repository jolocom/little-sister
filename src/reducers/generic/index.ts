import { AnyAction } from 'redux'

export const APPWRAP_UPDATE_STATE = 'APPWRAP_UPDATE_STATE'
export const APPWRAP_SHOW_LOADER = 'APPWRAP_SHOW_LOADER'
export const APPWRAP_REGISTER_STATE = 'APPWRAP_REGISTER_STATE'
export const APPWRAP_UNREGISTER_STATE = 'APPWRAP_UNREGISTER_STATE'

export interface AppWrapAttrs {
  readonly withoutSafeArea: boolean
  readonly withoutStatusBar: boolean
  readonly uninterruptible: boolean
  readonly loading: boolean
  readonly dark: boolean
  readonly breathy: boolean
  readonly centered: boolean
  readonly overlay: boolean
  readonly heightless: boolean
}
const initialAppWrapAttrs: AppWrapAttrs = {
  loading: false,
  withoutSafeArea: false,
  withoutStatusBar: false,
  uninterruptible: false,
  dark: false,
  breathy: false,
  centered: false,
  overlay: false,
  heightless: false,
}

export interface AppWrapState extends AppWapAttrs {
  readonly appWrapStatesSet: AppWrapAttrs[]
}
const initialAppWrapState: AppWrapState = {
  appWrapStatesSet: []
}

export const appWrapReducer = (
  state = initialAppWrapState,
  action: AnyAction,
): AppWrapState => {
  switch (action.type) {
    case APPWRAP_REGISTER_STATE:
      const idx = state.appWrapStatesSet.indexOf(action.value)
      if (idx > -1) return state
      return {
          ...state,
        appWrapStatesSet: [...state.appWrapStatesSet, action.value]
      return 
      return {...state, ...action.value}
    case APPWRAP_UNREGISTER_STATE:
      return {...state, ...action.value}
    case APPWRAP_SHOW_LOADER:
      return {...state, loading: action.value}
    default:
      return state
  }
}
