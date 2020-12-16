import partiallyAppliedAction from 'src/ui/deviceauth/utils/partiallyAppliedActions'
import { RecoveryActions } from './recoveryTypes'

export const setSeedKey = partiallyAppliedAction(RecoveryActions.setSeedKey)
export const setPhrase = partiallyAppliedAction(RecoveryActions.setPhrase)
export const resetPhrase = partiallyAppliedAction(RecoveryActions.resetPhrase)
export const setCurrentWordIdx = partiallyAppliedAction(
  RecoveryActions.setCurrentWordIdx,
)
export const setSuggestedKeys = partiallyAppliedAction(
  RecoveryActions.setSuggestedKeys,
)
export const showSuggestions = partiallyAppliedAction(
  RecoveryActions.showSuggestions,
)
export const hideSuggestions = partiallyAppliedAction(
  RecoveryActions.hideSuggestions,
)
export const setKeyIsValid = partiallyAppliedAction(
  RecoveryActions.setKeyIsValid,
)
export const setHasError = partiallyAppliedAction(RecoveryActions.setHasError)
export const submitKey = partiallyAppliedAction(RecoveryActions.submitKey)
