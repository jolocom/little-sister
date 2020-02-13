import React from 'react'
import { Wrapper, JolocomButton } from 'src/ui/structure'
import {
  StyleSheet,
  Keyboard,
  EmitterSubscription,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { DecoratedClaims } from 'src/reducers/account/'
import { TextInputField } from 'src/ui/home/components/textInputField'
import I18n from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Buttons, Typography, Colors, Spacing } from 'src/styles'

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
    const { claimData } = this.props.selectedClaim
    return Object.keys(claimData).every((c, idx, arr) => {
      const fieldName = c.replace(/[0-9]/g, '')
      const isMultiLineField = arr.some(
        field => field !== c && field.replace(/[0-9]/g, '') === fieldName,
      )

      if (isMultiLineField) {
        const fieldsToCheck = arr.filter(field => field.includes(fieldName))

        return fieldsToCheck.some(field => claimData[field].length > 0)
      }

      return claimData[c].length > 0
    });
  }

  render() {
    const {
      selectedClaim,
      selectedClaim: { credentialType, claimData },
    } = this.props
    const showButtonWhileTyping =
      !this.state.keyboardDrawn || Object.keys(claimData).length < 3

    return (
      <Wrapper>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll}>
          <Text style={styles.header}>{I18n.t(credentialType)}</Text>
          <View style={styles.textInputArea}>
            {this.renderInputFields(selectedClaim)}
          </View>
          <View style={styles.buttonArea}>
            {showButtonWhileTyping ? (
              <JolocomButton
                onPress={() => this.onSubmit()}
                text={I18n.t(strings.ADD_CLAIM)}
                disabled={!!this.confirmationEligibilityCheck()}
              />
            ) : null}
          </View>
        </ScrollView>
      </Wrapper>
    )
  }
}
