import React, { useState } from 'react'
import * as Keychain from 'react-native-keychain'
import { ActivityIndicator, Platform } from 'react-native'
import { NavigationScreenProp } from 'react-navigation'

import I18n from 'src/locales/i18n'

import PasscodeInput from './PasscodeInput'
import PasscodeHeader from './PasscodeHeader'

import { PIN_SERVICE, PIN_USERNAME } from './utils/keychainConsts'

import useResetKeychainValues from './hooks/useResetKeychainValues'
import useGetStoredAuthValues from './hooks/useGetStoredAuthValues'

import strings from '../../locales/strings'
import PasscodeWrapper from './components/PasscodeWrapper'
import { Wrapper } from '../structure'
import { NavigationSection } from '../errors/components/navigationSection'
import { ERROR_TIMEOUT } from './utils'
import Btn, { BtnTypes } from './components/Btn'
import { ThunkDispatch } from '../../store'
import { navigationActions } from '../../actions'
import { routeList } from '../../routeList'
import { connect } from 'react-redux'

interface PropsI extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<{}, {}>
}

const ChangePin: React.FC<PropsI> = ({
  navigation,
  navigateTorecoveryInstuction,
}) => {
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isCreateNew, setIsCreateNew] = useState(false)
  const [isSuccess, setSuccess] = useState(false)

  const { keychainPin, isLoadingStorage } = useGetStoredAuthValues()

  const resetServiceValuesInKeychain = useResetKeychainValues(PIN_SERVICE)

  const handlePinVerification = async () => {
    if (pin === keychainPin) {
      setIsCreateNew(true)
    } else {
      setHasError(true)
      setTimeout(() => {
        setPin('')
      }, ERROR_TIMEOUT)
    }
  }

  const handleSetNewPin = async () => {
    setSuccess(true)
    setTimeout(async () => {
      await resetServiceValuesInKeychain()
      await Keychain.setGenericPassword(PIN_USERNAME, newPin, {
        service: PIN_SERVICE,
      })
      navigation.goBack()
    }, 700)
  }

  const getHeader = () => {
    if (hasError) {
      return strings.WRONG_PIN
    } else {
      if (!isCreateNew) {
        return strings.CURRENT_PASSCODE
      } else {
        if (isSuccess) {
          return strings.PASSCODE_CHANGED
        }
        return strings.CREATE_NEW_PASSCODE
      }
    }
  }

  return (
    <Wrapper secondaryDark hideKeyboard>
      <NavigationSection
        isBackButton={false}
        onNavigation={() => navigation.goBack()}
      />
      <PasscodeWrapper>
        <PasscodeHeader>{I18n.t(getHeader())}</PasscodeHeader>
        {isLoadingStorage ? (
          <ActivityIndicator />
        ) : isCreateNew ? (
          <PasscodeInput
            value={newPin}
            stateUpdaterFn={setNewPin}
            onSubmit={handleSetNewPin}
            isSuccess={isSuccess}
          />
        ) : (
          <PasscodeInput
            value={pin}
            stateUpdaterFn={setPin}
            errorStateUpdaterFn={setHasError}
            onSubmit={handlePinVerification}
            hasError={hasError}
          />
        )}
        {!isSuccess && (
          <Btn
            customContainerStyles={{ marginTop: 30 }}
            customTextStyles={{
              opacity: 0.5,
              fontSize: Platform.select({
                ios: 20,
                android: 16,
              }),
              lineHeight: 22,
            }}
            type={BtnTypes.secondary}
            onPress={navigateTorecoveryInstuction}>
            {I18n.t(strings.FORGOT_YOUR_PIN)}
          </Btn>
        )}
      </PasscodeWrapper>
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateTorecoveryInstuction: () => {
    dispatch(
      navigationActions.navigate({ routeName: routeList.HowToChangePIN }),
    )
  },
})

export default connect(null, mapDispatchToProps)(ChangePin)
