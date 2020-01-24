import { AnyAction } from 'redux'

export const SETTINGS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  SET_LOCALE: 'SET_LOCALE',
  SET_SEED_PHRASE_SAVED: 'SET_SEED_PHRASE_SAVED',
  SET_AUTO_BACKUP: 'SET_AUTO_BACKUP',
  SET_LAST_BACKUP: 'SET_LAST_BACKUP',
}

export interface SettingsState {
  readonly locale: string
  readonly seedPhraseSaved: boolean
  readonly autoBackup: boolean
  readonly lastBackup?: string
}

const initialState: SettingsState = {
  locale: '',
  seedPhraseSaved: false,
  autoBackup: false,
}

export const settingsReducer = (
  state = initialState,
  action: AnyAction,
): SettingsState => {
  switch (action.type) {
    case SETTINGS.LOAD_SETTINGS:
      return action.value
    case SETTINGS.SET_LOCALE:
      return {
        ...state,
        locale: action.value,
      }
    case SETTINGS.SET_SEED_PHRASE_SAVED:
      return {
        ...state,
        seedPhraseSaved: true,
      }
    case SETTINGS.SET_AUTO_BACKUP:
      return {
        ...state,
        autoBackup: action.value,
      }
    case SETTINGS.SET_LAST_BACKUP:
      return {
        ...state,
        lastBackup: action.value,
      }
    default:
      return state
  }
}
