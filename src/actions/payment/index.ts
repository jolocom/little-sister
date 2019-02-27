import { Dispatch, AnyAction } from 'redux'
import { JolocomLib } from 'jolocom-lib'
import { BackendMiddleware } from 'src/backendMiddleware'
import { navigationActions, accountActions } from 'src/actions'
import { showErrorScreen } from 'src/actions/generic'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { PaymentRequest} from 'jolocom-lib/js/interactionTokens/paymentRequest'
import { jolocomEthTransactionConnector } from 'jolocom-lib/js/ethereum/transactionConnector'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { publicKeyToAddress } from  'jolocom-lib/js/utils/helper'
import { PaymentStateSummary } from 'src/reducers/payment'
import { routeList } from 'src/routeList'
import { Linking } from 'react-native'

export const setPaymentRequest = (request: PaymentStateSummary) => {
  return {
    type: 'SET_PAYMENT_REQUEST',
    value: request
  }
}

export const clearPaymentRequest = () => {
  return {
    type: 'CLEAR_PAYMENT_REQUEST'
  }
}

export const cancelPaymentRequest = () => {
  return (dispatch: Dispatch<AnyAction>, getState: Function) => {
    const { callbackURL } = getState().payment.activePaymentRequest
    dispatch(clearPaymentRequest())

    /**
     * This needs to be cleaned up after demo
     * TODO: consolidate routing back to callbackURL for deep linking for payment & sso
     */
    if (callbackURL.includes('http')) {
      dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
    } else {
      const url = callbackURL + Buffer.from(JSON.stringify({token: false})).toString('base64')
      Linking.openURL(url)
    }
  }
}

export const consumePaymentRequest = (paymentRequest: JSONWebToken<PaymentRequest>) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { identityWallet } = backendMiddleware

    try {
      await identityWallet.validateJWT(paymentRequest)

      const summary = {
        didRequester: paymentRequest.issuer, // TODO: replace with public profile data later
        description: paymentRequest.interactionToken.description,
        transactionDetails: paymentRequest.interactionToken.transactionDetails,
        requestJWT: paymentRequest.encode()
      }

      dispatch(setPaymentRequest(summary))
      dispatch(accountActions.toggleLoading(false))
      dispatch(navigationActions.navigate({ routeName: routeList.PaymentConsent }))
    } catch (err) {
      dispatch(accountActions.toggleLoading(false))
      dispatch(showErrorScreen(new Error('Consuming payment request failed.: ')))
    }
  }
}

export const sendPaymentResponse = () => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { keyChainLib, identityWallet, storageLib, encryptionLib } = backendMiddleware

    const { activePaymentRequest } = getState().payment
    const paymentRequest = JolocomLib.parse.interactionToken.fromJWT(activePaymentRequest.requestJWT)

    try {
      const password = await keyChainLib.getPassword()

      const ethAddress = publicKeyToAddress(identityWallet.getPublicKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey
      }))

      const tx = await jolocomEthTransactionConnector.createTransaction({
        ...paymentRequest.interactionToken.transactionDetails,
        senderAddress: ethAddress
      })

      const decryptedSeed = encryptionLib.decryptWithPass({
        cipher: await storageLib.get.encryptedSeed(),
        pass: password
      })

      const userVault = new SoftwareKeyProvider(Buffer.from(decryptedSeed, 'hex'), password)

      tx.sign(userVault.getPrivateKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey
      }))
  
      const txReceipt = await jolocomEthTransactionConnector.sendSignedTransaction(tx.serialize())

      const paymentResponseJWT = await identityWallet.create.interactionTokens.response.payment(
        { txHash: txReceipt.hash },
        password,
        paymentRequest
      )

      const { callbackURL } = paymentRequest.interactionToken
      // TODO: introduce generic handling linking vs https
      if (callbackURL.includes('http')) {
        await fetch(callbackURL, {
          method: 'POST',
          body: JSON.stringify({ token: paymentResponseJWT.encode() }),
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        const url = callbackURL + paymentResponseJWT.encode()
        Linking.openURL(url)
      }

      dispatch(clearPaymentRequest())
      dispatch(accountActions.toggleLoading(false))
      dispatch(navigationActions.navigate({ routeName: routeList.Home }))
    } catch (err) {
      dispatch(accountActions.toggleLoading(false))
      dispatch(showErrorScreen(new Error('Creating and sending payment response failed.')))
    }
  }
}
