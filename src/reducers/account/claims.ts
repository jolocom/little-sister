import { AnyAction } from 'redux'
import { assocPath } from 'ramda'
import {
  ClaimsState,
  CategorizedClaims,
  // DecoratedClaims,
} from 'src/reducers/account'

const categorizedClaims: CategorizedClaims = {
  Personal: [
    {
      credentialType: 'Name',
      claimData: {
        givenName: '',
        familyName: '',
      },
      id: '',
      issuer: '',
      subject: '',
    },
  ],
  Contact: [
    {
      credentialType: 'Email',
      claimData: {
        email: '',
      },
      id: '',
      issuer: '',
      subject: '',
      keyboardType: 'email-address',
    },
    {
      credentialType: 'Mobile Phone',
      claimData: {
        telephone: '',
      },
      id: '',
      issuer: '',
      subject: '',
      keyboardType: 'phone-pad',
    },
    {
      credentialType: 'Postal Address',
      claimData: {
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        city: '',
        country: '',
      },
      id: '',
      issuer: '',
      subject: '',
    },
  ],
  Other: [],
}

export const initialState: ClaimsState = {
  loading: false,
  selected: {
    credentialType: '',
    claimData: {},
    id: '',
    issuer: '',
    subject: '',
  },
  pendingExternal: [],
  decoratedCredentials: categorizedClaims,
}

export const claims = (
  state = initialState,
  action: AnyAction,
): ClaimsState => {
  switch (action.type) {
    case 'TOGGLE_CLAIMS_LOADING':
      return {...state, loading: action.value}
    case 'SET_CLAIMS_FOR_DID':
      return {...state, decoratedCredentials: action.claims}
    case 'SET_EXTERNAL':
      return {...state, pendingExternal: action.external}
    case 'RESET_EXTERNAL':
      return {...state, pendingExternal: []} // TODO Remove in favor of calling set external with empty array
    case 'SET_SELECTED':
      return {...state, selected: action.selected}
    case 'RESET_SELECTED':
      return {...state, selected: initialState.selected}
    case 'HANLDE_CLAIM_INPUT':
      return assocPath(['selected', 'claimsData', action.fieldName], action.fieldValue, state)({}) // TODO Error?
    default:
      return state
  }
}

// const addDefaultValues = (claims: CategorizedClaims) =>
//   Object.keys(categorizedClaims).reduce(
//     (acc: CategorizedClaims, category: string) => ({
//       ...acc,
//       [category]: injectPlaceholdersIfNeeded(category, claims[category]),
//     }),
//     {},
//   )

// const injectPlaceholdersIfNeeded = (
//   category: string,
//   claims: DecoratedClaims[],
// ): DecoratedClaims[] => {
//   if (!claims || claims.length === 0) {
//     return categorizedClaims[category]
//   }
//
//   const missing = categorizedClaims[category].filter(
//     defaultClaim =>
//       !claims.some(
//         claim => claim.credentialType === defaultClaim.credentialType,
//       ),
//   )
//
//   if (missing) {
//     return [...missing, ...claims]
//   }
//
//   return claims
// }
