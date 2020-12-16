import { ThunkAction } from '../store'
//import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { navigationActions, genericActions } from './index'
import { routeList } from '../routeList'
import settingKeys from '../ui/settings/settingKeys'
import { removeNotification, scheduleNotification } from './notifications'
import { entropyToMnemonic, mnemonicToEntropy } from 'bip39'
 // TODO Import ^ from jolocom-lib
import useResetKeychainValues from 'src/ui/deviceauth/hooks/useResetKeychainValues'
import { PIN_SERVICE } from 'src/ui/deviceauth/utils/keychainConsts'
import { createWarningNotification } from 'src/lib/notifications'
import strings from 'src/locales/strings'
import I18n from 'src/locales/i18n'

export const showSeedPhrase = (): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  const encryptedSeed = await agent.storage
    .get.setting('encryptedSeed')

  if (!encryptedSeed) {
    throw new Error('Can not retrieve Seed from database')
  }

  const decrypted = await agent.idw.asymDecrypt(
    Buffer.from(encryptedSeed.b64Encoded, 'base64'),
    await agent.passwordStore.getPassword()
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.SeedPhrase,
      params: { mnemonic: entropyToMnemonic(decrypted)},
    }),
  )
}

/**
 * called during PIN code restoration
 */
export const onRestoreAccess = (mnemonicInput: string[]): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  let recovered = false

  try {
    const recoveredEntropy = Buffer.from(
      mnemonicToEntropy(mnemonicInput.join(' ')),
      'hex'
    )
    if (agent.didMethod.recoverFromSeed) {
      const { identityWallet } = await agent.didMethod.recoverFromSeed(
        recoveredEntropy,
        await agent.passwordStore.getPassword()
      )
      recovered = identityWallet.did === agent.idw.did
    }
  } catch(e) {
    console.error('onRestoreAccess failed', e)
  }

  if (recovered) {
    const resetServiceValuesInKeychain = useResetKeychainValues(PIN_SERVICE)
    await resetServiceValuesInKeychain()
    dispatch(navigationActions.navigatorResetHome())

    // we re-lock the app, which will trigger the create pin screen
    return dispatch(genericActions.lockApp())
  } else {
    const notification = createWarningNotification({
      title: I18n.t(strings.AWKWARD),
      message: I18n.t(strings.IT_SEEMS_LIKE_WE_CANT_DO_THIS)
    })
    return dispatch(scheduleNotification(notification))
  }
}

export const setSeedPhraseSaved = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  // No delete call available yet, overwriting with empty object
  await backendMiddleware.storage.store.setting('encryptedSeed', {})
  await backendMiddleware.storage.store.setting(
    settingKeys.seedPhraseSaved,
    true,
  )

  const stickies = getState().notifications.queue.filter(n => !n.dismiss)

  stickies.map(sticky => dispatch(removeNotification(sticky)))

  return dispatch({
    type: 'SET_SEED_PHRASE_SAVED',
  })
}
