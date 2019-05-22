import { Document } from 'src/ui/documents/components/documentCard'
import { Action, AnyAction } from 'redux'
import { Dispatch } from 'react-redux'
import { navigationActions } from '..'
import { routeList } from 'src/routeList'
import I18n from 'src/locales/i18n'

export const SET_EXPIRED_DOC = 'SET_SELECTED_EXPIRED_DOCUMENT'
export const CLEAR_EXPIRED_DOC = 'CLEAR_SELECTED_EXPIRED_DOCUMENT'

export const setSelectedExpiredDocument = (document: Document): AnyAction => ({
  type: SET_EXPIRED_DOC,
  value: document,
})

export const clearSelectedExpiredDocument = (): Action => ({
  type: CLEAR_EXPIRED_DOC,
})

export const openExpiredDetails = (document: Document) => async (
  dispatch: Dispatch<AnyAction>,
) => {
  dispatch(setSelectedExpiredDocument(document))
  dispatch(
    navigationActions.navigate({
      routeName: routeList.ExpiredDetails,
      params: {
        headerTitle: `${I18n.t('[expired]')} ${document.details.type}`,
      },
    }),
  )
}
