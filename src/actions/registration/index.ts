import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import * as loading from 'src/actions/registration/loadingStages'
import { setDid } from 'src/actions/account'
import { ThunkAction } from 'src/store'
import { navigatorResetHome } from '../navigation'
import { setAutoBackup, setSeedPhraseSaved } from '../recovery'
import { EncryptedData } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'

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
  backendMiddleware,
) => {
  dispatch(
    navigationActions.navigate({
      routeName: routeList.RegistrationProgress,
    }),
  )

  const isRegistering = getState().registration.loading.isRegistering
  if (isRegistering) return

  dispatch(setIsRegistering(true))

  dispatch(setLoadingMsg(loading.loadingStages[0]))
  await backendMiddleware.createKeyProvider(encodedEntropy)

  dispatch(setLoadingMsg(loading.loadingStages[1]))
  await backendMiddleware.fuelKeyWithEther()

  dispatch(setLoadingMsg(loading.loadingStages[2]))
  const identity = await backendMiddleware.createIdentity()

  dispatch(setDid(identity.did))
  dispatch(setLoadingMsg(loading.loadingStages[3]))
  dispatch(setIsRegistering(false))

  return dispatch(navigatorResetHome())
}

export const recoverFromSeedPhrase = (mnemonic: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  dispatch(setIsRegistering(true))
  let pubKey
  try {
    pubKey = await backendMiddleware.recoverKeyProvider(mnemonic)
  } catch (e) {
    return dispatch(setIsRegistering(false))
  }

  const backup = await backendMiddleware.fetchBackup()
  if (backup) {
    dispatch(setAutoBackup(true, false))
    return dispatch(recoverIdentity(backup))
  }

  // No backup found, user needs to import manually
  // public key is needed to validate if the imported backup belongs to the recovered identity
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.ImportBackup,
      params: { pubKey },
    }),
  )
}

export const recoverIdentity = (
  encryptedBackup?: EncryptedData,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  // the backup should be validated before to avoid decryption failures at this point
  const backup = encryptedBackup
    ? await backendMiddleware.decryptBackup(encryptedBackup)
    : undefined
  const identity = await backendMiddleware.recoverIdentity(
    backup ? backup.did : undefined,
  )
  if (backup) await backendMiddleware.recoverData(backup)

  await dispatch(setDid(identity.did))
  await dispatch(setSeedPhraseSaved())
  await dispatch(setIsRegistering(false))
  return dispatch(navigatorResetHome())
}
