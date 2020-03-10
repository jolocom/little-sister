import { ThunkAction } from '../../store'
import { scheduleNotification } from './index'
import { createInfoNotification } from '../../lib/notifications'
import I18n from '../../locales/i18n'
import strings from '../../locales/strings'
import { AppError } from '../../lib/errors'
import { navigationActions } from '../index'
import { routeList } from '../../routeList'

export const scheduleOfflineNotification: ThunkAction = dispatch =>
  dispatch(
    scheduleNotification(
      createInfoNotification({
        title: I18n.t(strings.UH_OH_YOURE_NOT_CONNECTED),
        message: I18n.t(
          strings.WE_CANT_REGISTER_YOU_IF_YOU_DONT_HAVE_INTERNET_PLEASE_CHECK_YOUR_CONNECTION_AND_TRY_AGAIN,
        ),
      }),
    ),
  )

export const scheduleErrorNotification = (
  error: Error | AppError,
): ThunkAction => dispatch => {
  const notification = {
    title: I18n.t(strings.WHOOPS),
    message: I18n.t(
      strings.ITS_NOT_YOU_ITS_US_PLEASE_LET_US_KNOW_IF_YOURE_EXPERIENCING_THIS_ERROR_BY_FILING_A_REPORT,
    ),
    interact: {
      label: I18n.t(strings.REPORT),
      onInteract: () => {
        dispatch(
          navigationActions.navigate({
            routeName: routeList.ErrorReporting,
            params: { error },
          }),
        )
      },
    },
    dismiss: {
      timeout: 20000,
    },
  }
  return dispatch(scheduleNotification(createInfoNotification(notification)))
}
