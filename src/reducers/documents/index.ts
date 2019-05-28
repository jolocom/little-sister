import { AnyAction } from 'redux'
import { SET_EXPIRED_DOC, CLEAR_EXPIRED_DOC } from 'src/actions/documents'
import { DecoratedClaims } from '../account'

export interface DocumentsState {
  selectedExpiredDocument: DecoratedClaims
}

const initialState: DocumentsState = {
  selectedExpiredDocument: {
    credentialType: '',
    subject: '',
    id: '',
    issuer: '',
    expires: undefined,
    claimData: {
      type: '',
      documentNumber: '',
    },
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
