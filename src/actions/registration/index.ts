import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import * as loading from 'src/actions/registration/loadingStages'
import { setDid } from 'src/actions/account'
import { JolocomLib } from 'jolocom-lib'
import { generateSecureRandomBytes } from 'src/lib/util'
import { ThunkAction } from 'src/store'
import {
  awaitPaymentTxConfirmation,
  fuelAddress,
} from 'jolocom-lib-stax-connector/js/utils'
import { publicKeyToAddress } from 'jolocom-lib/js/utils/helper'
import { httpAgent } from '../../lib/http'
import { staxEndpoint } from '../../backendMiddleware'

const bip39 = require('bip39')

export const setLoadingMsg = (loadingMsg: string) => ({
  type: 'SET_LOADING_MSG',
  value: loadingMsg,
})

export const setIsRegistering = (value: boolean) => ({
  type: 'SET_IS_REGISTERING',
  value,
})

export const submitEntropy = (
  encodedEntropy: string,
): ThunkAction => dispatch => {
  dispatch(
    navigationActions.navigate({
      routeName: routeList.RegistrationProgress,
    }),
  )

  dispatch(setLoadingMsg(loading.loadingStages[0]))
  return dispatch(createIdentity(encodedEntropy))
}

export const startRegistration: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const randomPassword = await generateSecureRandomBytes(32)

  await backendMiddleware.keyChainLib.savePassword(
    randomPassword.toString('base64'),
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.Entropy,
    }),
  )
}

export const createIdentity = (encodedEntropy: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  // This is a just-in-case thing.... maybe multiple button taps or something
  const isRegistering = getState().registration.loading.isRegistering
  if (isRegistering) {
    return dispatch(
      navigationActions.navigate({
        routeName: routeList.RegistrationProgress,
      }),
    )
  }

  dispatch(setIsRegistering(true))

  const { encryptionLib, keyChainLib, storageLib, registry } = backendMiddleware

  const password = await keyChainLib.getPassword()
  const encEntropy = encryptionLib.encryptWithPass({
    data: encodedEntropy,
    pass: password,
  })

  const entropyData = { encryptedEntropy: encEntropy, timestamp: Date.now() }
  const userVault = JolocomLib.KeyProvider.fromSeed(
    Buffer.from(encodedEntropy, 'hex'),
    password,
  )

  dispatch(setLoadingMsg(loading.loadingStages[1]))

  const fuelingTxHash = await fuelAddress(
    `${staxEndpoint}/payment/fueling`,
    publicKeyToAddress(
      userVault.getPublicKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey,
      }),
    ),
    httpAgent,
    10e18,
  )

  const staxFueling = awaitPaymentTxConfirmation(
    `${staxEndpoint}/payment`,
    fuelingTxHash,
    httpAgent,
  )

  const jolocomFueling = JolocomLib.util.fuelKeyWithEther(
    userVault.getPublicKey({
      encryptionPass: password,
      derivationPath: JolocomLib.KeyTypes.ethereumKey,
    }),
  )

  await Promise.all([staxFueling, jolocomFueling])

  dispatch(setLoadingMsg(loading.loadingStages[2]))
  const identityWallet = await registry.create(userVault, password)

  const personaData = {
    did: identityWallet.identity.did,
    controllingKeyPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  }

  dispatch(setDid(identityWallet.identity.did))
  dispatch(setLoadingMsg(loading.loadingStages[3]))
  await backendMiddleware.setIdentityWallet(userVault, password)

  await storageLib.store.encryptedSeed(entropyData)
  await storageLib.store.persona(personaData)

  dispatch(setIsRegistering(false))

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.SeedPhrase,
      params: { mnemonic: bip39.entropyToMnemonic(encodedEntropy) },
    }),
  )
}
