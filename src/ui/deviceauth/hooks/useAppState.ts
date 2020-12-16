import { useRef, useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export const useAppState = (
  callback: (state: AppStateStatus, nextState: AppStateStatus) => void,
) => {
  const appState = useRef(AppState.currentState)

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    callback(appState.current, nextAppState)
    appState.current = nextAppState
  }

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange)
    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [])
}
