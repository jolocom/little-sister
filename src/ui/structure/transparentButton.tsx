import React from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native'
import { sandLight } from '../../styles/colors'
import { baseFontStyles, textLG } from '../../styles/typography'

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: sandLight,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 30,
    margin: 10,
  },
  text: {
    color: sandLight,
    ...baseFontStyles,
    fontSize: textLG,
    paddingTop: Platform.OS === 'ios' ? 5 : 0,
  },
})

interface Props extends TouchableHighlightProps {
  text: string
  textStyle?: TextStyle
}
export const TransparentButton: React.FC<Props> = props => {
  const { style, text, textStyle, ...otherProps } = props
  return (
    <TouchableHighlight style={[styles.container, style]} {...otherProps}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableHighlight>
  )
}
