import { AnyAction, Dispatch } from 'redux'
import { JolocomLib } from 'jolocom-lib'
import { navigationActions, genericActions } from 'src/actions/'
import { BackendMiddleware } from 'src/backendMiddleware'
import { routeList } from 'src/routeList'
import { DecoratedClaims } from 'src/reducers/account'
import { categoryUIDefinition, Categories } from 'src/actions/account/categories'
import { IVerifiableCredentialAttrs } from 'jolocom-lib/js/credentials/verifiableCredential/types'

export const setDid = (did: string) => {
  return {
    type: 'DID_SET',
    value: did
  }
}

// TODO Abstract parsing of error messages
export const checkIdentityExists = () => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware : BackendMiddleware) => {
    const { storageLib } = backendMiddleware

    try {
      const personas = await storageLib.get.persona()
      if (!personas.length) {
        return
      }

      dispatch(setDid(personas[0].did))
      dispatch(navigationActions.navigate({ routeName: routeList.Identity }))
    } catch(err) {
      if (err.message.indexOf('no such table') === 0) {
        return
      }

      dispatch(genericActions.showErrorScreen(err))
    }
  }
}

export const openClaimDetails = (claim: DecoratedClaims) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch({
      type: 'SET_SELECTED',
      selected: claim
    })
    dispatch(navigationActions.navigate({
      routeName: routeList.ClaimDetails
    }))
  }
}

export const saveClaim = (claimVal: string, claimField: string) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware : BackendMiddleware) => {
    console.log('saveClaim action: ', claimVal, claimField)
    dispatch(navigationActions.navigate({
      routeName: routeList.Identity
    }))
  }
}

export const toggleLoading = (val: boolean) => {
  return {
    type: 'SET_LOADING',
    loading: val
  }
}

export const getClaimsForDid = () => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function) => {
    const state = getState().account.claims.toJS()
    dispatch(toggleLoading(!state.loading))

    const claims = prepareClaimsForState(dummyC)
    dispatch({
        type: 'GET_CLAIMS_DID',
        claims
    })
  }
}

const prepareClaimsForState = (claims: IVerifiableCredentialAttrs[]) => {
  // TODO: Handle the category 'Other' for the claims that don't match any of predefined categories
  let categorizedClaims = new Map<string, DecoratedClaims[]>()
  const jolocomLib = new JolocomLib()
  Object.keys(Categories).forEach(category => {
    let claimsForCategory : DecoratedClaims[] = []
    claims.forEach(claim => {
      const VerifiableCredential = jolocomLib.credentials.createVerifiableCredential().fromJSON(claim)
      const name = VerifiableCredential.getDisplayName()
      const value = VerifiableCredential.getCredentialSection()[Object.keys(VerifiableCredential.getCredentialSection())[1]]
      if (categoryUIDefinition[category.toString()].filter(type => areCredTypesEqual(claim.type, type))) {
        claimsForCategory.push(
          { displayName: name,
            type: claim.type,
            claims: [
              { id: claim.id,
                value: value }
            ]
          } as DecoratedClaims
        )
      }
    })
    categorizedClaims.set(category.toString(), claimsForCategory)
  })
  return categorizedClaims
}

const areCredTypesEqual = (first: string[], second: string[]): boolean => {
  return first.every((el, index) => el === second[index])
}

const dummyC : any[]  = [
  {
    "@context": [
      "https://w3id.org/identity/v1","https://w3id.org/security/v1",
      "https://w3id.org/credentials/v1","http://schema.org"
    ],
    id: "claimId:a7e0aa7f5b1fe84c9552645c1fd50928ff8ae9f09580",
    name: 'E-mail',
    issuer:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb",
    type: ["Credential", "EmailCredential"],
    claim: {
      id: "did:jolo:test",
      email:"test@gmx.de"
    },
    issued: "2018-05-29T11:05:40.282Z",
    proof: {
      type:"EcdsaKoblitzSignature2016",
      created:"2018-05-29T11:05:40.283Z",
      creator:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb#keys-1",
      nonce: "b8cc7f31fd875290",
      signatureValue: "sA3hBXBy3tVjbTBngwZREgMlAlSlEYk3LuzGDqLEdqtdL3BjSgWWR7/Q+ZmTa6DjLNMgfE+Ib+eREM8v+43sqw=="
    }
  },
  {
    "@context": [
      "https://w3id.org/identity/v1","https://w3id.org/security/v1",
      "https://w3id.org/credentials/v1","http://schema.org"
    ],
    id: "claimId:a7e0aa7f5b1fe84c9552645c1fd50928ff8ae9f09585",
    name: 'Phone',
    issuer:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb",
    type: ["Credential", "PhoneCredential"],
    claim: {
      id: "did:jolo:test",
      telephone:"011-111"
    },
    issued: "2018-05-29T11:05:40.282Z",
    proof: {
      type:"EcdsaKoblitzSignature2016",
      created:"2018-05-29T11:05:40.283Z",
      creator:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb#keys-1",
      nonce: "b8cc7f31fd875290",
      signatureValue: "sA3hBXBy3tVjbTBngwZREgMlAlSlEYk3LuzGDqLEdqtdL3BjSgWWR7/Q+ZmTa6DjLNMgfE+Ib+eREM8v+43sqw=="
    }
  },
  {
    "@context": [
      "https://w3id.org/identity/v1","https://w3id.org/security/v1",
      "https://w3id.org/credentials/v1","http://schema.org"
    ],
    id: "claimId:a7e0aa7f5b1fe84c9552645c1fd50928ff8ae9f09587",
    name: 'Name',
    issuer:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb",
    type: ["Credential", "NameCredential"],
    claim: {
      id: "did:jolo:test",
      name: "Bobby Fischer"
    },
    issued: "2018-05-29T11:05:40.282Z",
    proof: {
      type:"EcdsaKoblitzSignature2016",
      created:"2018-05-29T11:05:40.283Z",
      creator:"did:jolo:8f977e50b7e5cbdfeb53a03c812913b72978ca35c93571f85e862862bac8cdeb#keys-1",
      nonce: "b8cc7f31fd875290",
      signatureValue: "sA3hBXBy3tVjbTBngwZREgMlAlSlEYk3LuzGDqLEdqtdL3BjSgWWR7/Q+ZmTa6DjLNMgfE+Ib+eREM8v+43sqw=="
    }
  }
]
