export enum RecoveryActions {
  setSeedKey,
  setPhrase,
  resetPhrase,
  setCurrentWordIdx,
  setSuggestedKeys,
  showSuggestions,
  hideSuggestions,
  setKeyIsValid,
  setHasError,
  submitKey,
}

export interface StateI {
  seedKey: string
  phrase: string[]
  currentWordIdx: number
  suggestedKeys: string[]
  areSuggestionsVisible: boolean
  keyIsValid: boolean
  keyHasError: boolean
}

export interface ActionI {
  type: RecoveryActions
  payload?: any
}
