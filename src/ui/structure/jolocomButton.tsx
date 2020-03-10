import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Buttons } from 'src/styles'
import LinearGradient from 'react-native-linear-gradient'
import { fontMedium } from '../../styles/typography'
import { useNetInfo } from '@react-native-community/netinfo'

const styles = StyleSheet.create({
  container: {
    ...Buttons.buttonStandardContainer,
  },
  text: {
    ...Buttons.buttonStandardText,
    fontFamily: fontMedium,
  },
  disabledText: {
    opacity: 0.25,
  },
  gradientWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
})

interface Props {
  onPress: () => void
  text: string
  disabled?: boolean
  containerStyle?: ViewStyle
  textStyle?: TextStyle
  testID?: string
  transparent?: boolean
}

export const JolocomButton: React.FC<Props> = props => {
  const {
    onPress,
    containerStyle,
    textStyle,
    text,
    disabled,
    transparent,
    testID,
  } = props
  const onButtonPress = () => (disabled ? null : onPress())
  const gradientColors = ['rgb(145, 25, 66)', 'rgb(210, 45, 105)']
  const gradient = transparent ? ['transparent', 'transparent'] : gradientColors

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        ...styles.container,
        ...containerStyle,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onButtonPress}
        testID={testID}
        style={styles.gradientWrapper}
      >
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {text}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

/***
 * A wrapper around JolocomButton which becomes disabled after pressed if there
 * is no connection. When the connection is resumed, the button becomes enabled again.
 * @param props: same as JolocomButton props
 */
export const OnlineJolocomButton: React.FC<Props> = props => {
  const isOnline = useNetInfo().isConnected
  const [wasPressed, setPressed] = useState(false)

  const modOnPress = () => {
    setPressed(true)
    props.onPress()
  }

  return (
    <JolocomButton
      {...props}
      onPress={modOnPress}
      disabled={wasPressed && !isOnline}
    />
  )
}
