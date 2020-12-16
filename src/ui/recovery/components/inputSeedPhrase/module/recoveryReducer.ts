import { StateI, ActionI, RecoveryActions } from './recoveryTypes'
export const initialRecoveryState = {
  seedKey: '',
  phrase: [],
  currentWordIdx: 0,
  suggestedKeys: [],
  areSuggestionsVisible: false,
  keyIsValid: false,
  keyHasError: false,
}

const recoveryReducer = (state: StateI, action: ActionI): StateI => {
  switch (action.type) {
    case RecoveryActions.setSeedKey:
      return onUpdateProp(state, action, 'seedKey')
    case RecoveryActions.setPhrase:
      return onUpdateProp(state, action, 'phrase')
    case RecoveryActions.resetPhrase:
      return initialRecoveryState
    case RecoveryActions.setCurrentWordIdx:
      return onUpdateProp(state, action, 'currentWordIdx')
    case RecoveryActions.setSuggestedKeys:
      return onUpdateProp(state, action, 'suggestedKeys')
    case RecoveryActions.setHasError:
      return onUpdateProp(state, action, 'keyHasError')
    case RecoveryActions.setKeyIsValid:
      return onUpdateProp(state, action, 'keyIsValid')
    case RecoveryActions.showSuggestions:
      return onShowSuggestions(state)
    case RecoveryActions.hideSuggestions:
      return onHideSuggestions(state)
    case RecoveryActions.submitKey:
      return onSubmitKey(state, action)
  }
}

const onUpdateProp = (state: StateI, action: ActionI, prop: string) => {
  return { ...state, [prop]: action.payload }
}

const onShowSuggestions = (state: StateI) => {
  return { ...state, areSuggestionsVisible: true }
}

const onHideSuggestions = (state: StateI) => {
  return { ...state, areSuggestionsVisible: false }
}

const onSubmitKey = (state: StateI, action: ActionI) => {
  if (action.payload) {
    let updatedPhrase
    if (state.currentWordIdx === state.phrase.length) {
      updatedPhrase = [...state.phrase, action.payload]
    } else {
      updatedPhrase = state.phrase.slice()
      updatedPhrase[state.currentWordIdx] = action.payload
    }
    return {
      ...state,
      phrase: updatedPhrase,
      currentWordIdx: state.currentWordIdx + 1,
      keyIsValid: false,
    }
  }
  return state
}

export default recoveryReducer
