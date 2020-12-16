import { useState, useEffect } from 'react'
import { Keyboard, KeyboardEventListener } from 'react-native'
import { useRecoveryDispatch } from './module/recoveryContext'
import { hideSuggestions, showSuggestions } from './module/recoveryActions'

export const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const recoveryDispatch = useRecoveryDispatch()

  const handleKeyboardShow: KeyboardEventListener = (e) => {
    setKeyboardHeight(e.endCoordinates.height);
    recoveryDispatch(showSuggestions())
  }

  const handleKeyboardHide = () => {
    setKeyboardHeight(0)
    recoveryDispatch(hideSuggestions())
  }

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
    Keyboard.addListener('keyboardDidHide', handleKeyboardHide)
    return () => {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardShow)
      Keyboard.removeListener('keyboardDidHide', handleKeyboardHide)
    }
  }, [])

  return { keyboardHeight }
}
