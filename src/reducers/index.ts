import { combineReducers } from 'redux'
import { settingsReducer, SettingsState } from 'src/reducers/settings/'
import { accountReducer, AccountState } from 'src/reducers/account/'
import {
  registrationReducer,
  RegistrationState,
} from 'src/reducers/registration/'
import { navigationReducer } from 'src/reducers/navigation/'
import { NavigationState } from 'react-navigation'
import { ssoReducer, SsoState } from 'src/reducers/sso/'
import { documentsReducer, DocumentsState } from './documents'

export const rootReducer = combineReducers({
  settings: settingsReducer,
  account: accountReducer,
  registration: registrationReducer,
  navigation: navigationReducer,
  sso: ssoReducer,
  document: documentsReducer,
})

export interface RootState {
  readonly settings: SettingsState
  readonly account: AccountState
  readonly registration: RegistrationState
  readonly navigation: NavigationState
  readonly sso: SsoState
  readonly documents: DocumentsState
}
