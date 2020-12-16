import React from 'react'
import { Wrapper, JolocomButton } from 'src/ui/structure'
import {
  StyleSheet,
  Keyboard,
  EmitterSubscription,
  ScrollView,
  Text,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { DecoratedClaims } from 'src/reducers/account/'
import { TextInputField } from 'src/ui/home/components/textInputField'
import I18n from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Buttons, Typography, Colors, Spacing } from 'src/styles'
import { inputFieldValidators } from 'src/utils/validateInput'
import { NavigationSection } from 'src/ui/errors/components/navigationSection'
import { Colors as ColorsEnum } from 'src/ui/deviceauth/colors'

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
  },
  header: {
    ...Typography.centeredText,
    ...Typography.mainText,
    color: Colors.blackMain,
    marginTop: Spacing.XL,
  },
  textInputArea: {
    alignItems: 'center',
    marginTop: Spacing.LG,
  },
  buttonArea: {
    alignItems: 'center',
    marginVertical: Spacing.XXL,
  },
  buttonContainer: {
    ...Buttons.buttonStandardContainer,
  },
  buttonContainerDisabled: {
    ...Buttons.buttonDisabledStandardContainer,
  },
  buttonText: {
    ...Buttons.buttonStandardText,
  },
  buttonTextDisabled: {
    ...Buttons.buttonDisabledStandardText,
  },
})

interface Props {
  selectedClaim: DecoratedClaims
  handleClaimInput: (fieldName: string, fieldValue: string) => void
  saveClaim: () => void
  onBackPress: () => void
}

interface State {
  pending: boolean
  keyboardDrawn: boolean
}

export class ClaimDetailsComponent extends React.Component<Props, State> {
  private kbShowListener!: EmitterSubscription
  private kbHideListener!: EmitterSubscription

  state = {
    pending: false,
    keyboardDrawn: false,
  }

  componentDidMount() {
    this.setupListeners()
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  private setupListeners(): void {
    this.kbShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this.setState({ keyboardDrawn: true }),
    )

    this.kbHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.setState({ keyboardDrawn: false }),
    )
  }

  private removeListeners(): void {
    this.kbShowListener.remove()
    this.kbHideListener.remove()
  }

  private onSubmit = () => {
    Keyboard.dismiss()
    this.setState({ pending: true })
    this.props.saveClaim()
  }

  private handleFieldInput = (fieldValue: string, fieldName: string) => {
    this.props.handleClaimInput(fieldValue, fieldName)
  }

  private renderInputFields = (claim: DecoratedClaims) => {
    const { claimData, keyboardType } = claim
    return Object.keys(claimData).map((item, idx) => (
      <TextInputField
        autoFocus={idx === 0}
        key={item}
        fieldName={item}
        fieldValue={claimData[item]}
        handleFieldInput={this.handleFieldInput}
        keyboardType={keyboardType}
      />
    ))
  }

  private confirmationEligibilityCheck = () =>
    !this.allDataCompleted || this.state.pending

  get allDataCompleted() {
    const { claimData, credentialType } = this.props.selectedClaim
    const validator =
      inputFieldValidators[credentialType] ||
      (input => {
        return true
      })
    return Object.keys(claimData).every((c, idx, arr) => {
      const fieldName = c.replace(/[0-9]/g, '')
      const isMultiLineField = arr.some(
        field => field !== c && field.replace(/[0-9]/g, '') === fieldName,
      )

      if (isMultiLineField) {
        const fieldValuesToCheck = arr
          .filter(field => field.includes(fieldName))
          .map(field => claimData[field])

        // at least one claim of size > 0
        return (
          fieldValuesToCheck.some(field => field.length > 0) &&
          fieldValuesToCheck.every(validator)
        )
      }
      return claimData[c].length > 0 && validator(claimData[c])
    })
  }

  render() {
    const {
      selectedClaim,
      selectedClaim: { credentialType },
    } = this.props

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        <Wrapper style={{ backgroundColor: 'transparent' }}>
          {Platform.OS === 'ios' ? (
            <NavigationSection
              isBackButton
              onNavigation={this.props.onBackPress}
              backButtonColor={ColorsEnum.black}
            />
          ) : null}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.scroll}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>{I18n.t(credentialType)}</Text>
            <View style={styles.textInputArea}>
              {this.renderInputFields(selectedClaim)}
            </View>
            <View style={styles.buttonArea}>
              <JolocomButton
                onPress={this.onSubmit}
                text={I18n.t(strings.ADD_CLAIM)}
                disabled={!!this.confirmationEligibilityCheck()}
              />
            </View>
          </ScrollView>
          <View style={{ paddingBottom: 10 }} />
        </Wrapper>
      </KeyboardAvoidingView>
    )
  }
}
