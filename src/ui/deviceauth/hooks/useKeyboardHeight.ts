import { useState, useEffect } from 'react'
import { Keyboard, Platform, KeyboardEvent } from 'react-native'

const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const handleKeyboardShow = (e: KeyboardEvent) => {
    setKeyboardHeight(() => {
      if (Platform.OS === 'android') {
        return 0
      } else {
        return e.endCoordinates.height
      }
    })
  }

  const handleKeyboardHide = () => {
    setKeyboardHeight(0)
  }

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
    Keyboard.addListener('keyboardDidHide', handleKeyboardHide)
  }, [])

  return { keyboardHeight }
}

export default useKeyboardHeight
