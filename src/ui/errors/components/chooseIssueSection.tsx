import React from 'react'
import { View } from 'react-native'
import { styles } from '../styles'
import strings from '../../../locales/strings'
import { DropdownIcon } from '../../../resources'
import ModalDropdown from 'react-native-modal-dropdown'
import { Inputs } from '../containers/errorReporting'
import I18n from 'src/locales/i18n'

interface PositionStyle {
  left?: number
  right?: number
  width?: number
  top?: number
}

interface Props {
  currentInput: Inputs
  pickedIssue: string | undefined
  onIssuePick: (issue: string) => void
  setInput: (input: Inputs) => void
}

export const ChooseIssueSection = (props: Props) => {
  const { currentInput, pickedIssue, onIssuePick, setInput } = props

  const issueList = [
    I18n.t(strings.NO_INTERNET_CONNECTION),
    I18n.t(strings.THE_APP_KEEPS_CRASHING),
    I18n.t(strings.CANT_LOGIN),
    I18n.t(strings.BACKUP_IS_EMPTY),
    I18n.t(strings.PROBLEMS_WITH_THE_INTERFACE),
    I18n.t(strings.SOMETHING_DOESNT_SEEM_RIGHT),
    I18n.t(strings.OTHER),
  ]

  return (
    <React.Fragment>
      <View style={{ marginTop: 20 }}>
        <View style={styles.pickerIconWrapper}>
          <DropdownIcon
            style={{
              transform:
                currentInput === Inputs.Dropdown ? [{ rotate: '180deg' }] : [],
            }}
          />
        </View>
        <ModalDropdown
          options={issueList}
          style={{
            ...styles.pickerWrapper,
            ...(currentInput === Inputs.Dropdown
              ? styles.highlightBorder
              : styles.defaultBorder),
          }}
          textStyle={{
            ...styles.inputText,
            ...(!pickedIssue ? styles.unselectedText : styles.defaultText),
          }}
          dropdownTextHighlightStyle={styles.selectedText}
          dropdownStyle={styles.pickerDropDown}
          dropdownTextStyle={{
            ...styles.inputText,
            ...styles.pickerDropdownText,
          }}
          defaultValue={I18n.t(strings.SELECT_AN_OPTION)}
          renderSeparator={() => null}
          adjustFrame={(position: PositionStyle) => ({
            left: 20,
            right: 20,
            top: position.top && position.top + 15,
            height: 'auto',
          })}
          onSelect={(_index, value) => {
            onIssuePick(value)
          }}
          onDropdownWillShow={() => {
            setInput(Inputs.Dropdown)
            return true
          }}
          onDropdownWillHide={() => {
            setInput(Inputs.None)
            return true
          }}
        />
      </View>
    </React.Fragment>
  )
}
