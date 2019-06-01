import { navigationActions } from '..'
import { routeList } from 'src/routeList'
import I18n from 'src/locales/i18n'
import { DecoratedClaims } from 'src/reducers/account'
import { ClaimInterface } from 'cred-types-jolocom-core'
import {ThunkDispatch} from '../../store'

export const SET_EXPIRED_DOC = 'SET_SELECTED_EXPIRED_DOCUMENT'
export const CLEAR_EXPIRED_DOC = 'CLEAR_SELECTED_EXPIRED_DOCUMENT'

export const setSelectedExpiredDocument = (
  document: DecoratedClaims,
) => ({
  type: SET_EXPIRED_DOC,
  value: document,
})

export const clearSelectedExpiredDocument = () => ({
  type: CLEAR_EXPIRED_DOC,
})

export const openExpiredDetails = (document: DecoratedClaims) => async (
  dispatch: ThunkDispatch,
) => {
  dispatch(setSelectedExpiredDocument(document))
  dispatch(
    navigationActions.navigate({
      routeName: routeList.ExpiredDetails,
      params: {
        headerTitle: `${I18n.t('[expired]')} ${
          (document.claimData as ClaimInterface).type
        }`,
      },
    }),
  )
}
