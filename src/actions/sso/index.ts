import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import {
  StateCredentialRequestSummary,
  StateVerificationSummary,
} from 'src/reducers/sso'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { getUiCredentialTypeByType } from 'src/lib/util'
import { convertToDecoratedClaim, resetSelected } from '../account'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { ThunkAction } from '../../store'
import { CredentialMetadataSummary } from '../../lib/storage/storage'
import { mergeRight, omit } from 'ramda'
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import { DecoratedClaims } from '../../reducers/account'
import { IdentitySummary } from './types'
import { AppError } from '../../lib/errors'
import ErrorCode from '../../lib/errorCodes'
import { Identity } from 'jolocom-lib/js/identity/identity'
import { DidDocument } from 'jolocom-lib/js/identity/didDocument/didDocument'
import { getMethodPrefixFromDid } from 'jolocom-lib/js/utils/crypto'
import { Platform } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'

export const setCredentialRequest = (
  request: StateCredentialRequestSummary,
) => ({
  type: 'SET_CREDENTIAL_REQUEST',
  value: request,
})

export const clearInteractionRequest = {
  type: 'CLEAR_INTERACTION_REQUEST',
}

export const setReceivingCredential = (
  requester: IdentitySummary,
  external: Array<{
    decoratedClaim: DecoratedClaims
    credential: SignedCredential
  }>,
) => ({
  type: 'SET_EXTERNAL',
  value: { offeror: requester, offer: external },
})

export const receiveExternalCredential = (
  credReceive: JSONWebToken<CredentialsReceive>,
  offeror: IdentitySummary,
  isDeepLinkInteraction: boolean,
  credentialOfferMetadata?: CredentialMetadataSummary[],
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { identityWallet, resolver, storageLib } = backendMiddleware

  await identityWallet.validateJWT(credReceive, undefined, resolver)
  const providedCredentials = credReceive.interactionToken.signedCredentials

  const validationResults = await JolocomLib.util.validateDigestibles(
    providedCredentials,
  )

  // TODO Error Code
  if (validationResults.includes(false)) {
    throw new Error('Invalid credentials received')
  }

  if (credentialOfferMetadata) {
    await Promise.all(
      credentialOfferMetadata.map(storageLib.store.credentialMetadata),
    )
  }

  if (offeror) {
    await storageLib.store.issuerProfile(offeror)
  }

  // TODO change convertToDecoratedClaim to (metadata) => (cred): decoratedClaim
  // the types of the cred metadata arrays where it is use differ too much to do it simply right now
  const asDecoratedCredentials = providedCredentials.map(cred => {
    const md = credentialOfferMetadata
      ? credentialOfferMetadata.filter(mds => cred.type.includes(mds.type))
      : undefined

    const renderInfo = md && md.length ? md[0].renderInfo : undefined

    return {
      ...convertToDecoratedClaim(cred),
      renderInfo,
    }
  })

  dispatch(
    setReceivingCredential(
      offeror,
      providedCredentials.map((cred, i) => ({
        credential: cred,
        decoratedClaim: asDecoratedCredentials[i],
      })),
    ),
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.CredentialDialog,
      params: { isDeepLinkInteraction },
      key: 'receiveExternalCredential',
    }),
  )
}

interface AttributeSummary {
  type: string[]
  results: Array<{
    verification: string
    fieldName: string
    values: string[]
  }>
}

export const consumeCredentialRequest = (
  decodedCredentialRequest: JSONWebToken<CredentialRequest>,
  isDeepLinkInteraction: boolean,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { storageLib, identityWallet, registry, resolver } = backendMiddleware
  const { did } = getState().account.did

  await identityWallet.validateJWT(
    decodedCredentialRequest,
    undefined,
    resolver,
  )

  // TODO
  const resolveFn =
    getMethodPrefixFromDid(keyIdToDid(decodedCredentialRequest.issuer)) ===
    'jolo'
      ? (did: string) => registry.resolve(did)
      : (did: string) =>
          resolver.resolve(did).then(didDoc =>
            Identity.fromDidDocument({
              didDocument: DidDocument.fromJSON(didDoc),
            }),
          )

  const { did: issuerDid, publicProfile } = await resolveFn(
    keyIdToDid(decodedCredentialRequest.issuer),
  )

  const parsedProfile = publicProfile
    ? omit(['id', 'did'], publicProfile.toJSON().claim)
    : {}

  const issuerInfo = mergeRight(
    { did: issuerDid },
    { publicProfile: parsedProfile },
  )

  const {
    requestedCredentialTypes: requestedTypes,
  } = decodedCredentialRequest.interactionToken

  const attributesForType = await Promise.all<AttributeSummary>(
    requestedTypes.map(storageLib.get.attributesByType),
  )

  const populatedWithCredentials = await Promise.all(
    attributesForType.map(async entry => {
      if (entry.results.length) {
        return Promise.all(
          entry.results.map(async result => ({
            type: getUiCredentialTypeByType(entry.type),
            values: result.values,
            verifications: await storageLib.get.verifiableCredential({
              id: result.verification,
            }),
          })),
        )
      }

      return [
        {
          type: getUiCredentialTypeByType(entry.type),
          values: [],
          verifications: [],
        },
      ]
    }),
  )

  const abbreviated = populatedWithCredentials.map(attribute =>
    attribute.map(entry => ({
      ...entry,
      verifications: entry.verifications.map((vCred: SignedCredential) => ({
        id: vCred.id,
        issuer: {
          did: vCred.issuer,
        },
        selfSigned: vCred.signer.did === did,
        expires: vCred.expires,
      })),
    })),
  )

  const flattened = abbreviated.reduce((acc, val) => acc.concat(val))

  // TODO requester shouldn't be optional
  const summary = {
    callbackURL: decodedCredentialRequest.interactionToken.callbackURL,
    requester: issuerInfo,
    availableCredentials: flattened,
    requestJWT: decodedCredentialRequest.encode(),
  }

  dispatch(setCredentialRequest(summary))
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.Consent,
      params: { isDeepLinkInteraction },
      key: 'credentialRequest',
    }),
  )
}

export const sendCredentialResponse = (
  selectedCredentials: StateVerificationSummary[],
  isDeepLinkInteraction: boolean = false,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { storageLib, keyChainLib, identityWallet } = backendMiddleware
  const {
    activeCredentialRequest: { callbackURL, requestJWT },
  } = getState().sso

  try {
    const password = await keyChainLib.getPassword()
    const request = JolocomLib.parse.interactionToken.fromJWT(requestJWT)

    const credentials = await Promise.all(
      selectedCredentials.map(
        async cred =>
          (await storageLib.get.verifiableCredential({ id: cred.id }))[0],
      ),
    )

    const jsonCredentials = credentials.map(cred => cred.toJSON())

    const response = await identityWallet.create.interactionTokens.response.share(
      {
        callbackURL,
        suppliedCredentials: jsonCredentials,
      },
      password,
      request,
    )

    if (isDeepLinkInteraction) {
      const callback = `${callbackURL}${
        callbackURL.endsWith('/') ? '' : '/'
      }${response.encode()}`

      if (!(await Linking.canOpenURL(callback))) {
        throw new AppError(ErrorCode.DeepLinkUrlNotFound)
      }

      return Linking.openURL(callback).then(() => dispatch(cancelSSO))
    } else {
      return RNFetchBlob.config({
        trusty: true,
      }).fetch(
        'POST',
        callbackURL,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ token: response.encode() }),
      )
    }
  } finally {
    dispatch(cancelSSO)
    dispatch(clearInteractionRequest)
  }
}

export const cancelSSO: ThunkAction = dispatch => {
  dispatch(clearInteractionRequest)
  return dispatch(navigationActions.navigatorResetHome())
}

export const cancelReceiving: ThunkAction = dispatch => {
  dispatch(resetSelected())
  return dispatch(navigationActions.navigatorResetHome())
}
