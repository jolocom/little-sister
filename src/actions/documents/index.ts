import { Document } from 'src/ui/documents/components/documentCard'
import { Action } from 'redux'

export const SET_EXPIRED_DOC = 'SET_SELECTED_EXPIRED_DOCUMENT'
export const CLEAR_EXPIRED_DOC = 'CLEAR_SELECTED_EXPIRED_DOCUMENT'

export const setSelectedExpiredDocument = (document: Document) => ({
  type: SET_EXPIRED_DOC,
  value: document,
})

export const clearSelectedExpiredDocument = (): Action => ({
  type: CLEAR_EXPIRED_DOC,
})
