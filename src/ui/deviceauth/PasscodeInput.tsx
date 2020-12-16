import React, {
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native'

import { Colors } from './colors'
import { useAppState } from './hooks/useAppState'

const PASSCODE_LENGTH = new Array(4).fill(0)
const DIGIT_CELL_WIDTH = 65
const DIGIT_MARGIN_RIGHT = 7

interface PasscodeInputI {
  value: string
  stateUpdaterFn: Dispatch<SetStateAction<string>>
  onSubmit: () => void
  errorStateUpdaterFn?: Dispatch<SetStateAction<boolean>>
  hasError?: boolean
  isSuccess?: boolean
}

type AddPasscodeFnT = (prevState: string, passcode?: string) => string
type RemovePasscodeFnT = (prevState: string) => string

const PasscodeInput: React.FC<PasscodeInputI> = ({
  value,
  stateUpdaterFn,
  errorStateUpdaterFn,
  onSubmit,
  hasError = false,
  isSuccess = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const inputRef = useRef<TextInput>(null)

  const digits = value.split('')
  const hideInput = !(digits.length < PASSCODE_LENGTH.length)

  const focusInput = () => {
    // NOTE: Workaround for the case when the Keyboard is dismissed with Back-button, and it can't @focus() again
    // https://github.com/facebook/react-native/issues/19366#issuecomment-400603928
    inputRef.current?.blur()
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  useAppState((appState, nextAppState) => {
    if (appState.match(/active/) && nextAppState === 'inactive') {
      // this is when the alert to use Biometry appears
      inputRef.current?.blur()
    } else if (
      ((Platform.OS === 'ios' && appState.match(/inactive/)) ||
        (Platform.OS === 'android' && appState.match(/background/))) &&
      nextAppState === 'active'
    ) {
      // this is when the alert to use Biometry disappears
      inputRef.current?.focus()
    }
    appState = nextAppState
  })

  // this will hide keyboard when passcode is complete
  useEffect(() => {
    if (value.length === 4) {
      onSubmit()
    }
  }, [value])

  // this will remove error once passoce is incompete
  useEffect(() => {
    if (value.length < 4 && hasError && errorStateUpdaterFn) {
      errorStateUpdaterFn(false)
    }
  }, [value])

  // this will make a delay so it will be possible to see digits and not only asterics
  useEffect(() => {
    let isCurrent = true
    const updateSelectedIndex = async () => {
      // it is implemented with delay to be able to preview digits and not seeing asterics straight away
      setTimeout(() => {
        isCurrent &&
          setSelectedIndex(() => {
            if (digits.length < PASSCODE_LENGTH.length) {
              return digits.length
            } else if (digits.length === 4) {
              return -1
            } else {
              return PASSCODE_LENGTH.length - 1
            }
          })
      }, 100)
    }
    updateSelectedIndex()
    return () => {
      isCurrent = false
    }
  }, [value])

  const handleFocus = () => {
    if (hasError && errorStateUpdaterFn) {
      errorStateUpdaterFn(false)
      stateUpdaterFn('')
    }
  }

  const handleRemove = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent?.key === 'Backspace') {
      handleRemovingFromPasscode()
    }
  }

  // a callback function that is passed (when we changing passcode) to setPasscode or setVerifiedPasscode
  const addToPasscodeCb: AddPasscodeFnT = (prevState, passcode) => {
    if (prevState.length >= PASSCODE_LENGTH.length) return prevState
    return (prevState + passcode).slice(0, PASSCODE_LENGTH.length)
  }

  // a callback function that is passed (when we removing digits from passcode) to setPasscode or setVerifiedPasscode
  const removeFromPasscodeCb: RemovePasscodeFnT = prevState => {
    if (!hasError) {
      return prevState.slice(0, prevState.length - 1)
    }
    return ''
  }

  // the first parameter is a setter function of passcode or verifiedPasscode, the second is deciding to add or to remove from/to passcode
  const updatePasscode = (
    passcodeManipulationFn: AddPasscodeFnT | RemovePasscodeFnT,
  ) => {
    return (passcodeUpdaterFn: Dispatch<SetStateAction<string>>) => {
      return (passcode?: string) => {
        passcodeUpdaterFn((prevState: string) =>
          passcodeManipulationFn(prevState, passcode),
        )
      }
    }
  }

  const addToPasscode = updatePasscode(addToPasscodeCb)
  const removeFromPasscode = updatePasscode(removeFromPasscodeCb)

  const handleAddingToPasscode = addToPasscode(stateUpdaterFn)
  const handleRemovingFromPasscode = removeFromPasscode(stateUpdaterFn)

  return (
    <View style={styles.inputContainer}>
      <TextInput
        value=""
        ref={inputRef}
        onChangeText={handleAddingToPasscode}
        onFocus={handleFocus}
        onKeyPress={handleRemove}
        autoFocus
        testID="passcode-digit-input"
        style={[
          styles.input,
          {
            left: selectedIndex * (DIGIT_CELL_WIDTH + DIGIT_MARGIN_RIGHT),
            opacity: hideInput ? 0 : 1,
          },
        ]}
        keyboardType="numeric"
        keyboardAppearance="dark"
        selectionColor="transparent"
      />
      <View style={{ flexDirection: 'row' }}>
        {PASSCODE_LENGTH.map((v, index) => {
          const isSelected = digits.length === index
          return (
            <TouchableWithoutFeedback key={index} onPress={focusInput}>
              <View
                style={[
                  styles.display,
                  isSelected && styles.active,
                  hasError && styles.error,
                  isSuccess && styles.success,
                ]}
                key={index}>
                <Text style={styles.text} testID="passcode-cell">
                  {index === selectedIndex
                    ? digits[index]
                    : index < digits.length
                    ? '*'
                    : ''}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
  },
  input: {
    textAlign: 'center',
    position: 'absolute',
    fontSize: 43,
    backgroundColor: 'transparent',
    width: DIGIT_CELL_WIDTH,
    borderRadius: 11,
    top: 0,
    bottom: 0,
  },
  display: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DIGIT_CELL_WIDTH,
    height: 87,
    borderRadius: 11,
    marginRight: DIGIT_MARGIN_RIGHT,
    backgroundColor: Colors.black,
    overflow: 'visible',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  active: {
    borderColor: Colors.activity,
  },
  error: {
    borderColor: Colors.error,
  },
  success: {
    borderColor: Colors.success,
  },
  text: {
    fontSize: 43,
    color: Colors.white,
  },
})

export default PasscodeInput
