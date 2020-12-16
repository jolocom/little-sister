import { useRef, useEffect, useCallback } from 'react'
import { Animated, Keyboard } from 'react-native'

const useAnimateRecoveryFooter = () => {
  const animatedSuggestions = useRef(new Animated.Value(1)).current
  const animatedBtns = useRef(new Animated.Value(1)).current

  const handleAnimateBtns = useCallback(() => {
    Animated.timing(animatedBtns, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleAnimateSuggestions = useCallback(() => {
    Animated.timing(animatedSuggestions, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    Keyboard.addListener('keyboardDidHide', handleAnimateBtns)
    Keyboard.addListener('keyboardDidShow', handleAnimateSuggestions)
    return () => {
      Keyboard.removeListener('keyboardDidHide', handleAnimateBtns)
      Keyboard.removeListener('keyboardDidShow', handleAnimateSuggestions)
    }
  }, [])

  return { animatedSuggestions, animatedBtns }
}

export default useAnimateRecoveryFooter
