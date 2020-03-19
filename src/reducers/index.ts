import { combineReducers } from 'redux'
import { settingsReducer, SettingsState } from 'src/reducers/settings'
import { accountReducer, AccountState } from 'src/reducers/account'
import {
  registrationReducer,
  RegistrationState,
} from 'src/reducers/registration/'
import { documentsReducer, DocumentsState } from './documents'
import { notificationsReducer, NotificationsState } from './notifications'
import { AppWrapState, appWrapReducer } from './generic'

export const rootReducer = combineReducers<RootState>({
  settings: settingsReducer,
  account: accountReducer,
  registration: registrationReducer,
  documents: documentsReducer,
  notifications: notificationsReducer,
  generic: appWrapReducer
})

export interface RootState {
  readonly settings: SettingsState
  readonly account: AccountState
  readonly registration: RegistrationState
  readonly documents: DocumentsState
  readonly notifications: NotificationsState
  readonly generic: AppWrapState
}
