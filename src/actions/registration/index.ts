import * as loading from 'src/actions/registration/loadingStages'
import { setDid } from 'src/actions/account'
import { navigatorResetHome } from '../navigation'
import { setSeedPhraseSaved } from '../recovery'
import { generateSecureRandomBytes } from '@jolocom/sdk/js/util'
import { ThunkAction } from '../../store'
import { entropyToMnemonic } from 'bip39'
import { genericActions, navigationActions } from '..'
import useResetKeychainValues from 'src/ui/deviceauth/hooks/useResetKeychainValues'
import { PIN_SERVICE } from 'src/ui/deviceauth/utils/keychainConsts'
import { createWarningNotification } from 'src/lib/notifications'
import { scheduleNotification } from '../notifications'
import strings from 'src/locales/strings'
import I18n from 'i18n-js'

const humanTimeout = () => new Promise(resolve => setTimeout(resolve, 1000))

export const setLoadingMsg = (loadingMsg: string) => ({
  type: 'SET_LOADING_MSG',
  value: loadingMsg,
})

export const setIsRegistering = (value: boolean) => ({
  type: 'SET_IS_REGISTERING',
  value,
})

export const createIdentity = (encodedEntropy: string): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  const isRegistering = getState().registration.loading.isRegistering
  if (isRegistering) return

  dispatch(setIsRegistering(true))

  // strings.REGISTERING_DECENTRALIZED_IDENTITY
  // aka "we are generating a random number"
  dispatch(setLoadingMsg(loading.loadingStages[0]))

  const seed = await generateSecureRandomBytes(16)
  const identity = await agent.loadFromMnemonic(entropyToMnemonic(seed))
  // and it's too fast so slow down
  await humanTimeout()

  // strings.ENCRYPTING_AND_STORING_DATA_LOCALLY
  dispatch(setLoadingMsg(loading.loadingStages[1]))

  // TODO Better call here.
  const encryptedSeed = await identity.asymEncryptToDid(
    Buffer.from(seed),
    identity.did, {
      prefix: '',
      resolve: async _ => identity.identity
    })

  await agent.storage.store.setting(
    'encryptedSeed',
    {
      b64Encoded: encryptedSeed.toString('base64')
    }
  )
  await humanTimeout()

  // strings.PREPARING_LAUNCH
  dispatch(setLoadingMsg(loading.loadingStages[2]))
  dispatch(setDid(identity.did))
  await humanTimeout()
  dispatch(setIsRegistering(false))

  // clear the saved PIN code, if any
  await useResetKeychainValues(PIN_SERVICE)()

  return dispatch(genericActions.lockApp())
}

export const recoverIdentity = (mnemonic: string): ThunkAction => async (
  dispatch,
  getState,
  agent,
) => {
  dispatch(setIsRegistering(true))
  try {
    const identity = await agent.loadFromMnemonic(mnemonic);

    dispatch(setDid(identity.did))
    await dispatch(setSeedPhraseSaved())

    await dispatch(navigatorResetHome())
    await dispatch(genericActions.lockApp())

    return dispatch(setIsRegistering(false))
  } catch (e) {
    const notification = createWarningNotification({
      title: I18n.t(strings.AWKWARD),
      message: I18n.t(strings.IT_SEEMS_LIKE_WE_CANT_DO_THIS)
    })
    dispatch(scheduleNotification(notification))
    dispatch(navigationActions.navigateBack())
    return dispatch(setIsRegistering(false))
  }
}
