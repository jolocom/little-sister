import { ThunkAction } from '../../store'
import { accountActions } from '../index'
import { createStickyNotification } from '../../lib/notifications'
import { scheduleNotification } from './index'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'
import { showSeedPhrase } from '../recovery'

export const checkRecoverySetup: ThunkAction = async (dispatch, getState) => {
  await dispatch(accountActions.hasExternalCredentials)

  const {
    settings: { seedPhraseSaved },
    account: {
      claims: { hasExternalCredentials },
    },
  } = getState()

  if (!seedPhraseSaved && hasExternalCredentials) {
    const notification = createStickyNotification({
      title: I18n.t(strings.CONFIRMATION_IS_NOT_COMPLETE),
      message: I18n.t(
        strings.YOUR_DATA_MAY_BE_LOST_BECAUSE_YOU_DID_NOT_CONFIRM_THE_SEED_PHRASE_WE_ADVISE_YOU_TO_COMPLETE_THE_REGISTRATION,
      ),
      interact: {
        label: strings.CONFIRM,
        onInteract: () => {
          dispatch(showSeedPhrase())
          return true
        },
      },
    })
    return dispatch(scheduleNotification(notification))
  }
}
