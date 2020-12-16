import React, { useContext, createContext, useReducer, Dispatch } from 'react'

import recoveryReducer, { initialRecoveryState } from './recoveryReducer'
import { StateI, ActionI } from './recoveryTypes'

const RecoveryStateContext = createContext<StateI>(initialRecoveryState)
const RecoveryDispatchContext = createContext<Dispatch<ActionI>>(() => null)

const RecoveryContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(recoveryReducer, initialRecoveryState)
  return (
    <RecoveryDispatchContext.Provider value={dispatch}>
      <RecoveryStateContext.Provider value={state} children={children} />
    </RecoveryDispatchContext.Provider>
  )
}

const useRecoveryState = () => {
  return useContext(RecoveryStateContext)
}

const useRecoveryDispatch = () => {
  return useContext(RecoveryDispatchContext)
}

export {
  useRecoveryState,
  useRecoveryDispatch,
  RecoveryContextProvider as default,
}
