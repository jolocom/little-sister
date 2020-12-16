import React from 'react'
import { TextStyle, Animated, StyleSheet, Platform, Text } from 'react-native'
import {
  titleFontStyles,
  subtitleFontStyles,
  JoloTextSizes,
  Fonts,
} from '../utils/fonts'

export enum JoloTextKind {
  title = 'title',
  subtitle = 'subtitle',
}

export enum JoloTextWeight {
  medium = 'medium',
  regular = 'regular',
}

interface PropsI {
  kind: JoloTextKind
  size: JoloTextSizes
  weight?: JoloTextWeight
  color?: string
  customStyles?: TextStyle | Animated.WithAnimatedValue<TextStyle>
  animated?: boolean
  testID?: string
}

const JoloText: React.FC<PropsI> = ({
  children,
  kind,
  size,
  weight,
  color,
  customStyles,
  animated,
  testID,
}) => {
  const TextComponent = animated ? Animated.Text : Text
  const fontStylesAllSizes =
    kind === JoloTextKind.title ? titleFontStyles : subtitleFontStyles
  const sizeStyles = {
    ...fontStylesAllSizes[size],
    ...(color && { color }),
    ...(weight && {
      fontFamily:
        weight === JoloTextWeight.medium ? Fonts.Medium : Fonts.Regular,
    }),
  }
  return (
    <TextComponent
      testID={testID}
      style={[styles.title, sizeStyles, customStyles]}>
      {children}
    </TextComponent>
  )
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    paddingTop: Platform.select({
      ios: 5,
      android: 0,
    }),
  },
})

export default JoloText
