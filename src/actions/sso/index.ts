import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { getUiCredentialTypeByType } from 'src/lib/util'
import {
  convertToDecoratedClaim,
  resetSelected,
  saveExternalCredentials,
} from '../account'
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
import { AppError, ErrorCode } from 'src/lib/errors'
import { generateIdentitySummary } from './utils'
import { ErrorScreenParams } from '../../ui/errors/containers/errorScreen'
import { scheduleNotification } from '../notifications'
import { createInfoNotification, Notification } from '../../lib/notifications'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'
import {
  localCredentialTypes,
  uiCredentialFromType,
} from '../../lib/categories'
import { intersection, isEmpty, compose, equals, complement } from 'ramda'

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
  const missingTypes = missingAttributeTypes(attributesForType)

  if (!isEmpty(missingTypes)) {
    const uiMissingCredentialTypes = missingTypes.map(uiCredentialFromType)

    const notification: Notification = createInfoNotification({
      dismiss: {
        timeout: 6000,
      },
      title: I18n.t(strings.HMM_LOOKS_LIKE_YOURE_MISSING_SOMETHING),
      message:
        I18n.t(strings.YOU_DO_NOT_HAVE_THE_FOLLOWING_RECORDS_TO_SEND) +
        uiMissingCredentialTypes.join(', '),
    })

    const notificationWithInteraction = {
      ...notification,
      interact: {
        label: I18n.t(strings.ADD_INFO),
        onInteract: () => {
          dispatch(navigationActions.navigate({ routeName: routeList.Claims }))
        },
      },
    }

    const anyExternalCred = compose(
      complement(equals(missingTypes)),
      intersection(localCredentialTypes),
    )(missingTypes)

    return dispatch(
      scheduleNotification(
        anyExternalCred ? notification : notificationWithInteraction,
      ),
    )
  }

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

  dispatch(
    scheduleNotification(
      createInfoNotification({
        title: I18n.t(strings.GREAT_SUCCESS),
        message: I18n.t(strings.YOU_HAVE_SECURELY_SHARED_YOUR_SELECTED_RECORDS),
      }),
    ),
  )

  dispatch(
    navigationActions.navigate({ routeName: routeList.InteractionScreen }),
  )
}

export const cancelSSO: ThunkAction = dispatch =>
  dispatch(navigationActions.navigatorResetHome())

export const cancelReceiving: ThunkAction = dispatch => {
  const params: ErrorScreenParams = {
    title: 'Are you sure about that?',
    message:
      'To get this document again - you have to start the whole process from the very first step',
    interact: {
      label: 'Save',
      onInteract: () => {
        dispatch(saveExternalCredentials)
      },
    },
    dismiss: {
      label: 'Decline anyway',
      onDismiss: () => {
        dispatch(resetSelected())
        dispatch(
          navigationActions.navigate({
            routeName: routeList.InteractionScreen,
          }),
        )
      },
    },
  }

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.ErrorScreen,
      params,
    }),
  )
}

const missingAttributeTypes = (attr: AttributeSummary[]) =>
  attr.reduce<string[]>((missing, attribute) => {
    if (isEmpty(attribute.results)) {
      const type = attribute.type
      missing.push(type[type.length - 1])
    }
    return missing
  }, [])
