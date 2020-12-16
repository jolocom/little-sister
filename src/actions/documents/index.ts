import * as navigationActions from 'src/actions/navigation'
import { routeList } from 'src/routeList'
import { DecoratedClaims } from 'src/reducers/account'
import { ThunkAction } from 'src/store'

export const SET_DOC_DETAIL = 'SET_SELECTED_DOCUMENT_DETAIL'
export const CLEAR_DOC_DETAIL = 'CLEAR_SELECTED_DOCUMENT_DETAIL'

export const setSelectedDocument = (document: DecoratedClaims) => ({
  type: SET_DOC_DETAIL,
  value: document,
})

export const clearSelectedDocument = () => ({
  type: CLEAR_DOC_DETAIL,
})

export const openDocumentDetails = (
  document: DecoratedClaims,
): ThunkAction => async dispatch => {
  dispatch(setSelectedDocument(document))
  dispatch(
    navigationActions.navigate({
      routeName: routeList.DocumentDetails,
    }),
  )
}
