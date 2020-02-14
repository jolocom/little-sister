import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
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
import { keyIdToDid } from 'jolocom-lib/js/utils/helper'
import { DecoratedClaims } from '../../reducers/account'
import {
  CredentialRequestSummary,
  CredentialVerificationSummary,
  IdentitySummary,
} from './types'
import { AppError } from '../../lib/errors'
import ErrorCode from '../../lib/errorCodes'
import { generateIdentitySummary } from './utils'

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
  const { identityWallet, registry, storageLib } = backendMiddleware

  await identityWallet.validateJWT(credReceive, undefined, registry)
  const providedCredentials = credReceive.interactionToken.signedCredentials

  const validationResults = await JolocomLib.util.validateDigestables(
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
  const { storageLib, identityWallet, registry } = backendMiddleware
  const { did } = getState().account.did

  await identityWallet.validateJWT(
    decodedCredentialRequest,
    undefined,
    registry,
  )

  const requester = await registry.resolve(
    keyIdToDid(decodedCredentialRequest.issuer),
  )

  const requesterSummary = generateIdentitySummary(requester)

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
  const credentialRequestDetails = {
    callbackURL: decodedCredentialRequest.interactionToken.callbackURL,
    requester: requesterSummary,
    availableCredentials: flattened,
    requestJWT: decodedCredentialRequest.encode(),
  }

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.Consent,
      params: { isDeepLinkInteraction, credentialRequestDetails },
      key: 'credentialRequest',
    }),
  )
}

export const sendCredentialResponse = (
  selectedCredentials: CredentialVerificationSummary[],
  credentialRequestDetails: CredentialRequestSummary,
  isDeepLinkInteraction: boolean = false,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  const { storageLib, keyChainLib, identityWallet } = backendMiddleware
  const { callbackURL, requestJWT } = credentialRequestDetails

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
    true
  )

  if (isDeepLinkInteraction) {
    const callback = `${callbackURL}${response.encode()}`
    if (!(await Linking.canOpenURL(callback))) {
      throw new AppError(ErrorCode.DeepLinkUrlNotFound)
    }

    return Linking.openURL(callback).then(() => dispatch(cancelSSO))
  }
  await fetch(callbackURL, {
    method: 'POST',
    body: JSON.stringify({ token: response.encode() }),
    headers: { 'Content-Type': 'application/json' },
  })
  dispatch(cancelSSO)
}

export const cancelSSO: ThunkAction = dispatch => {
  return dispatch(navigationActions.navigatorResetHome())
}

export const cancelReceiving: ThunkAction = dispatch => {
  dispatch(resetSelected())
  return dispatch(navigationActions.navigatorResetHome())
}
