import { ThunkAction } from '../store'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import { navigationActions } from './index'
import { routeList } from '../routeList'
import settingKeys from '../ui/settings/settingKeys'
import { SETTINGS } from '../reducers/settings'
import Share from 'react-native-share'
import { toBase64 } from '../lib/util'
import { removeNotification } from './notifications'

export const showSeedPhrase = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const encryptedSeed = await backendMiddleware.storageLib.get.encryptedSeed()
  if (!encryptedSeed) {
    throw new Error('Can not retrieve Seed from database')
  }
  // TODO create vault from encrypted Seed
  const pass = await backendMiddleware.keyChainLib.getPassword()
  const vault = new SoftwareKeyProvider(Buffer.from(encryptedSeed, 'hex'))
  const mnemonic = vault.getMnemonic(pass)
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.SeedPhrase,
      params: { mnemonic },
    }),
  )
}

export const setSeedPhraseSaved = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  await backendMiddleware.storageLib.store.setting(
    settingKeys.seedPhraseSaved,
    true,
  )

  // TODO: find sticky by id from queue, not active
  const {
    notifications: { active: stickyNotification },
  } = getState()
  if (stickyNotification) dispatch(removeNotification(stickyNotification))

  return dispatch({
    type: SETTINGS.SET_SEED_PHRASE_SAVED,
  })
}

export const setAutoBackup = (
  isEnabled: boolean,
  shouldUpload: boolean = true,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  await backendMiddleware.storageLib.store.setting(
    settingKeys.autoBackup,
    isEnabled,
  )
  await dispatch({
    type: SETTINGS.SET_AUTO_BACKUP,
    value: isEnabled,
  })
  // initial backup creation and upload (after store is updated)
  if (isEnabled && shouldUpload) await dispatch(autoBackupData())
}

// if no value is provided the current date-time is used
export const setLastBackup = (value?: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const currDate = value === undefined ? new Date().toISOString() : value
  await backendMiddleware.storageLib.store.setting(
    settingKeys.lastBackup,
    currDate,
  )
  return dispatch({
    type: SETTINGS.SET_LAST_BACKUP,
    value: currDate,
  })
}

export const disableAndRemoveBackup = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  dispatch(setAutoBackup(false, false))
  dispatch(setLastBackup(''))
  await backendMiddleware.deleteBackup()
}

export const manualBackup = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const encryptedBackup = await backendMiddleware.backupData(false)

  // throws if user dismissed the share dialog (sharing is assumed to be successful
  // as soon as an app is selected --> not always "really" successful)
  await Share.open({
    filename: 'jolocom-backup', // not working currently, will work with react-native-share >=2.0.0 https://github.com/react-native-community/react-native-share/pull/565
    url: `data:text/plain;base64,${toBase64(JSON.stringify(encryptedBackup))}`,
  })
  // in case something throws (e.g. upload fails, user dismissed) this code will not be reached
  dispatch(setLastBackup())
}

export const autoBackupData = (): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  if (getState().settings.autoBackup) await backendMiddleware.backupData(true)
  dispatch(setLastBackup())
}
