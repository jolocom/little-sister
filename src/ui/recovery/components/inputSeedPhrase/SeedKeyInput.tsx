import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  Platform,
  Dimensions,
} from 'react-native'
import { useRecoveryDispatch, useRecoveryState } from './module/recoveryContext'

import LeftArrow from './components/LeftArrow'
import RightArrow from './components/RightArrow'

import { getSuggestedSeedKeys, isKeyValid } from './utils/mnemonic'

import RecoveryInputMetadata from './RecoveryInputMetadata'
import {
  setSeedKey,
  setCurrentWordIdx,
  setSuggestedKeys,
  showSuggestions,
  setKeyIsValid,
  setHasError,
  submitKey,
  hideSuggestions,
} from './module/recoveryActions'
import { titleFontStyles } from './utils/fonts'
import BP from './utils/breakpoints'
import { Colors } from 'src/ui/deviceauth/colors'
import { useDelay } from './hooks/generic'

const SCREEN_HEIGHT = Dimensions.get('window').height

const SeedKeyInput: React.FC = () => {
  const inputRef = useRef<TextInput>(null)

  const dispatch = useRecoveryDispatch()
  const {
    currentWordIdx,
    phrase,
    seedKey,
    suggestedKeys,
    keyHasError,
    keyIsValid,
  } = useRecoveryState()

  const [isSuccessBorder, setIsSuccessBorder] = useState(keyIsValid)

  const selectPrevWord = () => {
    dispatch(setCurrentWordIdx(currentWordIdx - 1))
  }
  const selectNextWord = () => {
    dispatch(setCurrentWordIdx(currentWordIdx + 1))
  }

  const handleSeedKeyChange = useCallback(
    (val: string) => {
      if (currentWordIdx < 12) {
        dispatch(setSeedKey(val))
      }
    },
    [currentWordIdx],
  )

  const handleInputFocus = useCallback(() => {
    dispatch(showSuggestions())
  }, [])

  const handleInputBlur = () => {
    dispatch(hideSuggestions())
  }

  // this is invoked when next keyboard button is pressed
  const handleSubmitEditing = (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => {
    if (keyIsValid) {
      dispatch(submitKey(e.nativeEvent.text))
    }
  }

  // after the phrase is complete - keyboard hides, to bring keyoboard back when user moves across keys in phrase
  const renderedTimes = useRef(0)
  useEffect(() => {
    renderedTimes.current++
    if (renderedTimes) {
      if (
        inputRef.current &&
        inputRef.current.isFocused &&
        !inputRef.current.isFocused()
      ) {
        inputRef.current?.focus()
      }
    }
  }, [currentWordIdx])

  // when we move with arrows select a current seedKey
  useEffect(() => {
    const updateInput = async () => {
      if (currentWordIdx !== 0) {
        setIsSuccessBorder(true)
        await useDelay(() => setIsSuccessBorder(false), 100)
      }
      await useDelay(() => {
        dispatch(setSeedKey(phrase[currentWordIdx]))
      }, 200)
    }
    updateInput()
  }, [currentWordIdx])

  // this for showing buttons back instead of suggestions
  useEffect(() => {
    if (currentWordIdx === 12 && phrase.length === 12) {
      dispatch(hideSuggestions())
      dispatch(setKeyIsValid(false))
      inputRef.current?.blur()
    }
  }, [currentWordIdx, phrase])

  // this is for fetching suggested keys based on the input
  useEffect(() => {
    if (seedKey && seedKey.length > 1) {
      const suggestions = getSuggestedSeedKeys(seedKey)
      dispatch(setSuggestedKeys(suggestions))

      const isValid = isKeyValid(seedKey)
      dispatch(setKeyIsValid(isValid))
    } else {
      dispatch(setSuggestedKeys([]))
    }
  }, [seedKey])

  // this is for coloring input box to indicate no match error
  useEffect(() => {
    if (seedKey && seedKey.length > 1) {
      dispatch(setHasError(true))
    } else {
      dispatch(setHasError(false))
    }
  }, [suggestedKeys])

  return (
    <View style={styles.inputContainer}>
      <View
        style={[
          styles.inputField,
          keyHasError && !suggestedKeys.length && styles.inputError,
          isSuccessBorder && styles.inputValid,
        ]}>
        {currentWordIdx > 0 && <LeftArrow handlePress={selectPrevWord} />}
        <TextInput
          value={seedKey}
          ref={inputRef}
          onChangeText={handleSeedKeyChange}
          onSubmitEditing={handleSubmitEditing}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={[titleFontStyles.big, styles.input]}
          testID="seedphrase-input"
          keyboardAppearance="dark"
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          autoFocus
          //@ts-ignore
          textAlign="center"
          returnKeyType="done"
          blurOnSubmit={false}
          spellCheck={false}
          autoCorrect={false}
          //NOTE: disables suggestions on Android https://stackoverflow.com/a/51411575
          keyboardType={
            Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'
          }
          inputAccessoryViewID="suggestions"
        />
        {currentWordIdx !== phrase.length && currentWordIdx < 12 && (
          <RightArrow handlePress={selectNextWord} />
        )}
      </View>
      <RecoveryInputMetadata />
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: 0.25 * SCREEN_HEIGHT,
        marginTop: BP({
          default: 30,
          medium: 50,
          large: 70,
        }),
      },
    }),
    width: '100%',
  },
  inputField: {
    width: '100%',
    backgroundColor: 'black',
    height: BP({
      default: 87,
      xsmall: 50,
    }),
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 2,
  },
  input: {
    width: '70%',
    color: Colors.white,
    textDecorationLine: 'none',
    lineHeight: BP({ xsmall: 28, small: 32, default: 36 }),
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  inputValid: {
    borderColor: Colors.success,
  },
})

export default SeedKeyInput
