import { AnyAction } from 'redux'

export const APPWRAP_UPDATE_STATE = 'APPWRAP_UPDATE_STATE'
export const APPWRAP_SHOW_LOADER = 'APPWRAP_SHOW_LOADER'

export interface AppWrapState {
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

const initialAppWrapState: AppWrapState = {
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

export const appWrapReducer = (
  state = initialAppWrapState,
  action: AnyAction,
): AppWrapState => {
  switch (action.type) {
    case APPWRAP_UPDATE_STATE:
      return {...state, ...action.value}
    case APPWRAP_SHOW_LOADER:
      return {...state, loading: action.value}
    default:
      return state
  }
}
