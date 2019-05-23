import { AnyAction } from 'redux'
import { SET_EXPIRED_DOC, CLEAR_EXPIRED_DOC } from 'src/actions/documents'
import { Document } from 'src/ui/documents/components/documentCard'

export interface DocumentsState {
  selectedExpiredDocument: Document
}

const initialState: DocumentsState = {
  selectedExpiredDocument: {
    issuer: '',
    valid_until: undefined,
    details: {
      id_number: '',
      type: '',
    },
    background: {},
  },
}

export const documentsReducer = (
  state = initialState,
  action: AnyAction,
): DocumentsState => {
  switch (action.type) {
    case SET_EXPIRED_DOC:
      return { ...state, selectedExpiredDocument: action.value }
    case CLEAR_EXPIRED_DOC:
      return {
        ...state,
        selectedExpiredDocument: initialState.selectedExpiredDocument,
      }
    default:
      return state
  }
}
