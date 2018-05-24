import React from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { Button } from 'react-native-material-ui'
import { Container, Header, Block, CenteredText } from 'src/ui/structure'
import { JolocomTheme } from 'src/styles/jolocom-theme'

interface Props {
  lineColorPassword: string
  lineColorRepeat: string
  keyboardDrawn: boolean
  password: string
  confirmPassword: string
  onPasswordChange: (input:  string) => void
  onPasswordConfirmChange: (input:  string) => void
  clickNext: () => void
  onFocusRepeat: () => void
  onBlurRepeat: () => void
  onFocusPassword: () => void
  onBlurPassword: () => void
}

const styles = StyleSheet.create({
  subHeader: {
    fontSize: 20,
    fontFamily: JolocomTheme.contentFontFamily,
    padding: '10%',
    color: JolocomTheme.primaryColorSand
  },
  infoPassword: {
    fontSize: 14,
    fontFamily: JolocomTheme.contentFontFamily,
    opacity: 0.6,
    padding: '10%',
    color: JolocomTheme.primaryColorSand
  },
  textInputField: {
    padding: '3%',
    color: JolocomTheme.primaryColorWhite,
    fontSize: 22,
    fontFamily: JolocomTheme.contentFontFamily,
    width: '80%',
  },
  textErrorField: {
    color: JolocomTheme.primaryColorSandInactive,
    fontSize: 14
  },
  mainContainer: {
    justifyContent: 'space-between',
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  nestedContainer: {
    justifyContent: 'space-around',
  },
  buttonContainer: {
    width: 164,
    height: 48,
    backgroundColor: JolocomTheme.primaryColorPurple
  },
  buttonText: {
    fontFamily: JolocomTheme.contentFontFamily,
    fontSize: 22,
    fontWeight: "100",
    backgroundColor: JolocomTheme.primaryColorPurple
  }
})

export const PasswordEntryComponent : React.SFC<Props> = props => {
  const { password, confirmPassword, keyboardDrawn } = props
  const errorMsg = validateInput(password, confirmPassword)

  return (
    <Container style={ styles.mainContainer }>
      <Block style={ styles.nestedContainer } flex={ 0.4 }>
        <Header title={ keyboardDrawn ? '' : 'Step 2' }/>
        <CenteredText
          style={ styles.subHeader }
          msg={ keyboardDrawn ? '' : 'Set a password to encrypt your data on the device' }
        />
        <CenteredText
          style={ styles.infoPassword }
          msg={ 'This password will be stored in your keychain. After setting it, please make sure you have passcode enabled.' }
        />
      </Block>
      <Block style={ styles.nestedContainer } flex={ 0.3 }>
        <TextInput
          style={ styles.textInputField }
          placeholder={ 'Password' }
          maxLength={ 40 }
          editable
          secureTextEntry
          keyboardType={ 'default' }
          onChangeText={ props.onPasswordChange }
          onFocus={ props.onFocusPassword }
          onBlur={ props.onBlurPassword }
          placeholderTextColor={ JolocomTheme.primaryColorSandInactive }
          selectionColor= { JolocomTheme.primaryColorPurple } 
          underlineColorAndroid= { props.lineColorPassword }
        /> 
        <TextInput
          style={ styles.textInputField }
          placeholder={ 'Repeat password' }
          maxLength={ 40 }
          editable
          secureTextEntry
          keyboardType={ 'default' }
          onChangeText={ props.onPasswordConfirmChange }
          onFocus={ props.onFocusRepeat }
          onBlur={ props.onBlurRepeat }
          placeholderTextColor={ JolocomTheme.primaryColorSandInactive }
          selectionColor= { JolocomTheme.primaryColorPurple }
          underlineColorAndroid= { props.lineColorRepeat }
        />
        <CenteredText
          style={ styles.textErrorField }
          msg={ password.length > 5 ? errorMsg : '' }
        />
      </Block>
      <Block flex={ 0.1 }>
        <Button
          style={ !errorMsg ? { container: styles.buttonContainer, text: styles.buttonText } : { container: styles.buttonContainer, text: styles.buttonText } }
          onPress={ props.clickNext }
          raised
          primary
          upperCase={ false }
          disabled={ !!errorMsg }
          text="Continue"
        />
      </Block>
    </Container>
  )
}

const validateInput = (password: string, confirmPassword: string) : string => {
  if (password.indexOf(' ') !== -1) {
    return 'No spaces allowed'
  }

  if (!password.match((/[A-Z]/))) {
    return 'At least one uppercase letter needed'
  }

  if (!password.match((/[0-9]/))) {
    return 'At least one number needed'
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }

  if (password.length < 8) {
    return 'At least 8 characters are required'
  }

  return ''
}
