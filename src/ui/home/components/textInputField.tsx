import React from 'react'
import { View, StyleSheet } from 'react-native'
import I18n from 'src/locales/i18n'
import { Colors, Typography } from 'src/styles'
const ReactMUI = require('react-native-material-textfield')

interface Props {
  autoFocus?: boolean
  fieldValue: string
  fieldName: string
  handleFieldInput: (fieldValue: string, fieldName: string) => void
  keyboardType?: string
}

const styles = StyleSheet.create({
  fieldStyle: {
    fontFamily: Typography.fontMain,
  },
  inputContainer: {
    height: 72,
    width: '80%',
  },
  labelStyle: {
    color: Colors.grey,
    fontFamily: Typography.fontMain,
  },
})

const humanize = (attrName: string) => {
  const text = attrName.replace(/([A-Z])/g, ' $1')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const TextInputField: React.FC<Props> = (props: Props) => {
  const {
    fieldValue,
    fieldName,
    handleFieldInput,
    keyboardType,
    autoFocus,
  } = props
  const labelText = I18n.t(humanize(fieldName))
  return (
    <View style={styles.inputContainer}>
      <ReactMUI.TextField
        autoFocus={autoFocus}
        label={labelText}
        labelTextStyle={styles.labelStyle}
        style={styles.fieldStyle}
        tintColor={Colors.purpleMain}
        textColor={Colors.blackMain}
        value={fieldValue}
        onChangeText={(fieldValue: string) => {
          handleFieldInput(fieldValue, fieldName)
        }}
        keyboardType={keyboardType}
      />
    </View>
  )
}
