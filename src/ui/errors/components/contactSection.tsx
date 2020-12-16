import { Text, TextInput } from 'react-native'
import { styles } from '../styles'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'
import React from 'react'
import { Inputs } from '../containers/errorReporting'

interface Props {
  onContactInput: (text: string) => void
  currentInput: Inputs
  setInput: (input: Inputs) => void
  contactValue: string
}

export const ContactSection = (props: Props) => {
  const { onContactInput, contactValue, currentInput, setInput } = props
  return (
    <React.Fragment>
      <TextInput
        onChangeText={onContactInput}
        value={contactValue}
        placeholder={I18n.t(strings.LEAVE_US_YOUR_EMAIL_AND_NUMBER)}
        placeholderTextColor={styles.unselectedText.color}
        style={{
          ...styles.inputLine,
          ...(currentInput === Inputs.Contact
            ? styles.highlightBottomBorder
            : styles.defaultBottomBorder),
        }}
        onFocus={() => setInput(Inputs.Contact)}
        onBlur={() => setInput(Inputs.None)}
      />
      <Text style={{ ...styles.sectionDescription, marginTop: 12 }}>
        {I18n.t(
          strings.WE_DO_NOT_STORE_ANY_DATA_AND_DO_NOT_SPAM_ANY_USER_INFORMATION_WILL_BE_DELETED_IMMEDIATELY_AFTER_SOLVING_THE_PROBLEM,
        )}
      </Text>
    </React.Fragment>
  )
}
