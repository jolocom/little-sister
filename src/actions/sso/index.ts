import { navigationActions } from 'src/actions'
import { ThunkAction } from '../../store'
import { scheduleNotification } from '../notifications'
import { createInfoNotification } from 'src/lib/notifications'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import { routeList } from '../../routeList'
import { setInteracting } from '../account'

export {
  consumeAuthenticationRequest,
  sendAuthenticationResponse,
} from './authenticationRequest'

export {
  consumeCredentialOfferRequest,
  consumeCredentialReceive,
  validateSelectionAndSave,
} from './credentialOffer'

export {
  consumeCredentialRequest,
  sendCredentialResponse,
} from './credentialRequest'

export {
  consumeEstablishChannelRequest,
  startChannel,
} from './establishChannel'

export { consumeResolutionRequest } from './resolution'

export const cancelSSO: ThunkAction = dispatch => {
  dispatch(setInteracting(false))
  return dispatch(
    navigationActions.navigate({ routeName: routeList.InteractionScreen }),
  )
}

export const scheduleSuccessNotification: ThunkAction = dispatch => {
  return dispatch(
    scheduleNotification(
      createInfoNotification({
        title: I18n.t(strings.GREAT_SUCCESS),
        message: I18n.t(strings.INTERACTION_WITH_THE_SERVICE_COMPLETED),
      }),
    ),
  )
}
