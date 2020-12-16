import React, { useState, useCallback, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import * as Keychain from 'react-native-keychain'

import I18n from 'src/locales/i18n'

import Header from './components/Header'
import Paragraph, { ParagraphSizes } from './components/Paragraph'
import Btn, { BtnTypes } from './components/Btn'
import PasscodeInput from './PasscodeInput'
import strings from '../../locales/strings'
import { PIN_USERNAME, PIN_SERVICE } from './utils/keychainConsts'
import { BP } from 'src/styles/breakpoints'

import { Colors } from './colors'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'src/store'
import { genericActions } from 'src/actions'
import { NavigationInjectedProps } from 'react-navigation'
import useDisableBackButton from './hooks/useDisableBackButton'
import { Wrapper } from '../structure'
import PasscodeWrapper from './components/PasscodeWrapper'
import { ERROR_TIMEOUT } from './utils'

interface PropsI
  extends NavigationInjectedProps,
    ReturnType<typeof mapDispatchToProps> {}

const RegisterPIN: React.FC<PropsI> = ({ unlockApplication, navigation }) => {
  const [isCreating, setIsCreating] = useState(true) // to display create passcode or verify passcode
  const [passcode, setPasscode] = useState('')
  const [verifiedPasscode, setVerifiedPasscode] = useState('')
  const [hasError, setHasError] = useState(false) // to indicate if verifiedPasscode doesn't match passcode

  useDisableBackButton(
    useCallback(() => {
      // don't let react-navigation handle this back button press if we are
      // focused
      return navigation.isFocused()
    }, []),
  )

  const handlePasscodeSubmit = useCallback(() => {
    setIsCreating(false)
  }, [])

  const handleVerifiedPasscodeSubmit = async () => {
    if (passcode === verifiedPasscode) {
      try {
        // setting up pin in the keychain
        await Keychain.setGenericPassword(PIN_USERNAME, passcode, {
          service: PIN_SERVICE,
        })
      } catch (err) {
        console.log({ err })
      }
      unlockApplication(passcode)
    } else {
      setHasError(true)
      setTimeout(() => {
        setVerifiedPasscode('')
        setHasError(false)
      }, ERROR_TIMEOUT)
    }
  }

  const resetPasscode = () => {
    setIsCreating(true)
    setPasscode('')
    setVerifiedPasscode('')
    setHasError(false)
  }

  useEffect(() => {
    if (verifiedPasscode.length < 4 && hasError) {
      setHasError(false)
    }
  }, [verifiedPasscode])

  return (
    <Wrapper secondaryDark>
      <PasscodeWrapper customStyles={{ paddingTop: 38 }}>
        <View>
          <Header color={Colors.white90}>
            {isCreating
              ? I18n.t(strings.CREATE_PASSCODE)
              : I18n.t(strings.VERIFY_PASSCODE)}
          </Header>
          <Paragraph
            color={Colors.white70}
            size={ParagraphSizes.medium}
            customStyles={{ opacity: 0.8, marginHorizontal: 15, marginTop: 8 }}>
            {I18n.t(strings.ADDING_AN_EXTRA_LAYER_OF_SECURITY)}
          </Paragraph>
        </View>
        <View style={styles.passcodeContainer}>
          {isCreating ? (
            <PasscodeInput
              value={passcode}
              stateUpdaterFn={setPasscode}
              onSubmit={handlePasscodeSubmit}
            />
          ) : (
            <PasscodeInput
              value={verifiedPasscode}
              stateUpdaterFn={setVerifiedPasscode}
              onSubmit={handleVerifiedPasscodeSubmit}
              errorStateUpdaterFn={setHasError}
              hasError={hasError}
            />
          )}
        </View>
        {isCreating ? (
          <Paragraph
            size={ParagraphSizes.medium}
            color={Colors.success}
            customStyles={{ marginTop: 20, marginHorizontal: 30 }}>
            {I18n.t(strings.ANY_FUTURE_PASSCODE_RESTORE)}
          </Paragraph>
        ) : (
          <Btn type={BtnTypes.secondary} onPress={resetPasscode}>
            {I18n.t(strings.RESET)}
          </Btn>
        )}
      </PasscodeWrapper>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  passcodeContainer: {
    marginTop: BP({
      large: '30%',
      medium: '30%',
      small: '10%',
    }),
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
    left: '38%',
    top: 100,
  },
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  unlockApplication: (pin: string) =>
    dispatch(genericActions.unlockApp(pin, true)),
})

export default connect(null, mapDispatchToProps)(RegisterPIN)
