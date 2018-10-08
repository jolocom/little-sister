import { AnyAction } from 'redux'
import Immutable from 'immutable'
import { ClaimsState, CategorizedClaims } from 'src/reducers/account'

const categorizedClaims: CategorizedClaims = {
  'Personal': [{
    credentialType: 'Name',
    claimData: {
      givenName: '',
      familyName: ''
    },
    id: '',
    issuer: '',
    subject: ''
  }],
  'Contact': [{
    credentialType: 'E-mail',
    claimData: {
      email: ''
    },
    id: '',
    issuer: '',
    subject: ''
  },
  {
    credentialType: 'Phone',
    claimData: {
      telephone: ''
    },
    id: '',
    issuer: '',
    subject: ''
  }]
}

export const initialState: ClaimsState = {
  loading: false,
  selected: {
    credentialType: '',
    claimData: {},
    id: '',
    issuer: '',
    subject: ''
  },
  decoratedCredentials: categorizedClaims
}

export const claims = (state = Immutable.fromJS(initialState), action: AnyAction): ClaimsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return state.setIn(['loading'], action.loading)
    case 'SET_CLAIMS_FOR_DID':
      return state.setIn(['decoratedCredentials'], action.claims).setIn(['loading'], false)
    case 'SET_SELECTED':
      return state.setIn(['selected'], action.selected)
    default:
      return state
  }
}
