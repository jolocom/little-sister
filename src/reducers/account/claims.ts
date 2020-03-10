import { AnyAction } from 'redux'
import {
  CategorizedClaims,
  ClaimsState,
  DecoratedClaims,
} from 'src/reducers/account'
import { HAS_EXTERNAL_CREDENTIALS } from '../../actions/account/actionTypes'
import { CredentialTypes } from '../../lib/categories'

const categorizedClaims: CategorizedClaims = {
  Personal: [
    {
      credentialType: CredentialTypes.Name,
      claimData: {
        givenName: '',
        familyName: '',
      },
      id: '',
      issuer: {
        did: '',
      },
      subject: '',
    },
  ],
  Contact: [
    {
      credentialType: CredentialTypes.Email,
      claimData: {
        email: '',
      },
      id: '',
      issuer: {
        did: '',
      },
      subject: '',
      keyboardType: 'email-address',
    },
    {
      credentialType: CredentialTypes.MobilePhone,
      claimData: {
        telephone: '',
      },
      id: '',
      issuer: {
        did: '',
      },
      subject: '',
      keyboardType: 'phone-pad',
    },
    {
      credentialType: CredentialTypes.PostalAddress,
      claimData: {
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        city: '',
        country: '',
      },
      id: '',
      issuer: {
        did: '',
      },
      subject: '',
    },
  ],
  // /** @dev FOR TESTING */
  Other: [],
}

export const initialState: ClaimsState = {
  selected: {
    credentialType: '',
    claimData: {},
    id: '',
    issuer: {
      did: '',
    },
    subject: '',
  },
  pendingExternal: {
    offeror: {
      did: '',
    },
    offer: [],
  },
  decoratedCredentials: categorizedClaims,
  hasExternalCredentials: false,
}

export const claims = (
  state = initialState,
  action: AnyAction,
): ClaimsState => {
  switch (action.type) {
    case 'SET_CLAIMS_FOR_DID':
      return { ...state, decoratedCredentials: addDefaultValues(action.claims) }
    case HAS_EXTERNAL_CREDENTIALS:
      return { ...state, hasExternalCredentials: action.value }
    case 'SET_EXTERNAL':
      return { ...state, pendingExternal: action.value }
    case 'RESET_EXTERNAL':
      return { ...state, pendingExternal: initialState.pendingExternal } // TODO Remove in favor of calling set external with empty array
    case 'SET_SELECTED':
      return { ...state, selected: action.selected }
    case 'RESET_SELECTED':
      return { ...state, selected: initialState.selected }
    case 'HANDLE_CLAIM_INPUT':
      // NOTE: this is handled slightly differently so that we prevent the
      // claimData keys from being re-ordered, as they are used to generate the
      // fields in ui/home/components/claimDetails
      const claimData = { ...state.selected.claimData }
      claimData[action.fieldName] = action.fieldValue

      return {
        ...state,
        selected: {
          ...state.selected,
          claimData,
        },
      }
    default:
      return state
  }
}

const addDefaultValues = (claims: CategorizedClaims) =>
  Object.keys(categorizedClaims).reduce(
    (acc: CategorizedClaims, category: string) => ({
      ...acc,
      [category]: injectPlaceholdersIfNeeded(category, claims[category]),
    }),
    {},
  )

const injectPlaceholdersIfNeeded = (
  category: string,
  claims: DecoratedClaims[],
): DecoratedClaims[] => {
  if (!claims || claims.length === 0) {
    return categorizedClaims[category]
  }

  const missing = categorizedClaims[category].filter(
    defaultClaim =>
      !claims.some(
        claim => claim.credentialType === defaultClaim.credentialType,
      ),
  )

  if (missing) {
    return [...missing, ...claims]
  }

  return claims
}
