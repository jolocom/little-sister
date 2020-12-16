import { Text, TextInput, View } from 'react-native'
import { styles } from '../styles'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'
import { ToggleSwitch } from '../../structure/toggleSwitch'
import React from 'react'
import { Inputs } from '../containers/errorReporting'

interface Props {
  currentInput: Inputs
  setInput: (input: Inputs) => void
  setDescription: (text: string) => void
  toggleState: boolean
  setToggle: (state: boolean) => void
  description: string
}

export const DescriptionSection = (props: Props) => {
  const {
    currentInput,
    setDescription,
    setInput,
    toggleState,
    setToggle,
    description,
  } = props

  return (
    <React.Fragment>
      <Text style={{ ...styles.sectionDescription, marginTop: 16 }}>
        {I18n.t(strings.YOU_CAN_PROVIDE_FURTHER_DETAILS_ABOUT_THE_ISSUE_HERE)}
      </Text>
      <TextInput
        style={{
          ...styles.inputBlock,
          ...(currentInput === Inputs.Description
            ? styles.highlightBorder
            : styles.defaultBorder),
        }}
        onChangeText={text => setDescription(text)}
        value={description}
        placeholderTextColor={styles.unselectedText.color}
        numberOfLines={3}
        textAlignVertical={'top'}
        multiline={true}
        placeholder={I18n.t(strings.TAP_TO_WRITE)}
        onFocus={() => setInput(Inputs.Description)}
        onBlur={() => setInput(Inputs.None)}
      />
      <View style={styles.switchSection}>
        <View style={styles.switchWrapper}>
          <ToggleSwitch
            value={toggleState}
            onToggle={() => setToggle(!toggleState)}
            onGradient={[
              styles.gradientOnStart.color,
              styles.gradientOnEnd.color,
            ]}
            offGradient={[styles.gradientOff.color, styles.gradientOff.color]}
            trackColor={styles.trackColor.color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionDescription}>
            {I18n.t(strings.INCLUDE_YOUR_LOGS)}
          </Text>
          <Text
            style={{
              ...styles.sectionDescription,
              ...styles.unselectedText,
              marginTop: 4,
            }}
          >
            {I18n.t(
              strings.THIS_INCLUDES_SOME_PRIVATE_METADATA_INFO_FILESIZES_BUT_NOT_NAMES_OR_CONTENTS_BUT_IT_WILL_HELP_DEVELOPERS_FIX_BUGS_MORE_QUICKLY,
            )}
          </Text>
        </View>
      </View>
    </React.Fragment>
  )
}
