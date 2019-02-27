import { Dispatch, AnyAction } from 'redux'
import { Linking } from 'react-native'
import { JolocomLib } from 'jolocom-lib'
import { StateCredentialRequestSummary, StateVerificationSummary } from 'src/reducers/sso'
import { BackendMiddleware } from 'src/backendMiddleware'
import { navigationActions, accountActions, interactionHandlerActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { showErrorScreen } from 'src/actions/generic'
import { getUiCredentialTypeByType } from 'src/lib/util'
import { resetSelected } from '../account'
import { CredentialOffer } from 'jolocom-lib/js/interactionTokens/credentialOffer'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialsReceive } from 'jolocom-lib/js/interactionTokens/credentialsReceive'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { getIssuerPublicKey } from 'jolocom-lib/js/utils/helper'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { KeyTypes } from 'jolocom-lib/js/vaultedKeyProvider/types'

export const setCredentialRequest = (request: StateCredentialRequestSummary) => {
  return {
    type: 'SET_CREDENTIAL_REQUEST',
    value: request
  }
}

export const clearCredentialRequest = () => {
  return {
    type: 'CLEAR_CREDENTIAL_REQUEST'
  }
}

export const setReceivingCredential = (external: SignedCredential[]) => {
  return {
    type: 'SET_EXTERNAL',
    external
  }
}

export const resetReceivingCredential = () => {
  return {
    type: 'RESET_EXTERNAL'
  }
}

export const consumeCredentialOfferRequest = (credOfferRequest: JSONWebToken<CredentialOffer>) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { keyChainLib, identityWallet } = backendMiddleware

    try {
      await identityWallet.validateJWT(credOfferRequest)

      const password = await keyChainLib.getPassword()
      const credOfferResponse = await identityWallet.create.interactionTokens.response.offer(
        {
          callbackURL: credOfferRequest.interactionToken.callbackURL,
          instant: credOfferRequest.interactionToken.instant,
          requestedInput: {}
        },
        password,
        credOfferRequest
      )

      const res = await fetch(credOfferRequest.interactionToken.callbackURL, {
        method: 'POST',
        body: JSON.stringify({ token: credOfferResponse.encode() }),
        headers: { 'Content-Type': 'application/json' }
      }).then(body => body.json())

      dispatch(interactionHandlerActions.parseJWT(res.token))
    } catch (err) {
      dispatch(accountActions.toggleLoading(false))
      dispatch(showErrorScreen(new Error('JWT Token parse failed')))
    }
  }
}

export const receiveExternalCredential = (credReceive: JSONWebToken<CredentialsReceive>) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { identityWallet } = backendMiddleware

    try {
      await identityWallet.validateJWT(credReceive)
    } catch (error) {
      console.log(error)
      dispatch(showErrorScreen(new Error('Validation of external credential token failed')))
    }

    try {
      const providedCredentials = credReceive.interactionToken.signedCredentials
      const registry = JolocomLib.registries.jolocom.create()

      const results = await Promise.all(
        providedCredentials.map(async vcred => {
          const remoteIdentity = await registry.resolve(vcred.issuer)
          return SoftwareKeyProvider.verifyDigestable(
            getIssuerPublicKey(vcred.signer.keyId, remoteIdentity.didDocument),
            vcred
          )
        })
      )

      if (results.every(el => el === true)) {
        dispatch(setReceivingCredential(providedCredentials))
        dispatch(accountActions.toggleLoading(false))
        dispatch(navigationActions.navigate({ routeName: routeList.CredentialDialog }))
      } else {
        dispatch(accountActions.toggleLoading(false))
        dispatch(showErrorScreen(new Error('Signature validation failed')))
      }
    } catch (error) {
      dispatch(accountActions.toggleLoading(false))
      dispatch(showErrorScreen(new Error('Signature validation on external credential failed')))
    }
  }
}

interface AttributeSummary {
  type: string[]
  results: Array<{
    verification: string
    fieldName: string
    values: string[]
  }>
}

export const consumeCredentialRequest = (decodedCredentialRequest: JSONWebToken<CredentialRequest>) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { storageLib, identityWallet } = backendMiddleware
    const { did } = getState().account.did.toJS()

    try {
      await identityWallet.validateJWT(decodedCredentialRequest)
      const requestedTypes = decodedCredentialRequest.interactionToken.requestedCredentialTypes
      const attributesForType = await Promise.all<AttributeSummary>(requestedTypes.map(storageLib.get.attributesByType))

      const populatedWithCredentials = await Promise.all(
        attributesForType.map(async entry => {
          if (entry.results.length) {
            return Promise.all(
              entry.results.map(async result => ({
                type: getUiCredentialTypeByType(entry.type),
                values: result.values,
                verifications: await storageLib.get.verifiableCredential({ id: result.verification })
              }))
            )
          }

          return [
            {
              type: getUiCredentialTypeByType(entry.type),
              values: [],
              verifications: []
            }
          ]
        })
      )

      const abbreviated = populatedWithCredentials.map(attribute =>
        attribute.map(entry => ({
          ...entry,
          verifications: entry.verifications.map((vCred: SignedCredential) => ({
            id: vCred.id,
            issuer: vCred.issuer,
            selfSigned: vCred.signer.did === did,
            expires: vCred.expires
          }))
        }))
      )
      const flattened = abbreviated.reduce((acc, val) => acc.concat(val))

      // TODO requester shouldn't be optional
      const summary = {
        callbackURL: decodedCredentialRequest.interactionToken.callbackURL,
        requester: decodedCredentialRequest.issuer,
        availableCredentials: flattened,
        requestJWT: decodedCredentialRequest.encode()
      }

      dispatch(setCredentialRequest(summary))
      dispatch(accountActions.toggleLoading(false))
      dispatch(navigationActions.navigate({ routeName: routeList.Consent }))
    } catch (error) {
      console.log(error)
      dispatch(showErrorScreen(new Error('Consumption of credential request failed')))
    }
  }
}

export const sendCredentialResponse = (selectedCredentials: StateVerificationSummary[]) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { storageLib, keyChainLib, encryptionLib } = backendMiddleware
    const { activeCredentialRequest } = getState().sso

    try {
      const registry = JolocomLib.registries.jolocom.create()
      const password = await keyChainLib.getPassword()
      const decryptedSeed = encryptionLib.decryptWithPass({
        cipher: await storageLib.get.encryptedSeed(),
        pass: password
      })
      const userVault = new SoftwareKeyProvider(Buffer.from(decryptedSeed, 'hex'), password)

      const wallet = await registry.authenticate(userVault, {
        derivationPath: KeyTypes.jolocomIdentityKey,
        encryptionPass: password
      })

      const credentials = await Promise.all(
        selectedCredentials.map(async cred => (await storageLib.get.verifiableCredential({ id: cred.id }))[0])
      )

      const jsonCredentials = credentials.map(cred => cred.toJSON())

      const request = JolocomLib.parse.interactionToken.fromJWT(activeCredentialRequest.requestJWT)
      const credentialResponse = await wallet.create.interactionTokens.response.share(
        {
          callbackURL: activeCredentialRequest.callbackURL,
          suppliedCredentials: jsonCredentials
        },
        password,
        request
      )

      if (activeCredentialRequest.callbackURL.includes('http')) {
        await fetch(activeCredentialRequest.callbackURL, {
          method: 'POST',
          body: JSON.stringify({ token: credentialResponse.encode() }),
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        const url = activeCredentialRequest.callbackURL + credentialResponse.encode()
        Linking.openURL(url)
      }
      dispatch(clearCredentialRequest())
      dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
    } catch (error) {
      // TODO: better error message
      dispatch(showErrorScreen(new Error('The credential response could not be created')))
    }
  }
}

export const cancelSSO = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(clearCredentialRequest())
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
  }
}

export const cancelReceiving = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(resetSelected())
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
  }
}
