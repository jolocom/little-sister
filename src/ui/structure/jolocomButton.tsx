import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native'
import { Buttons } from 'src/styles'
import LinearGradient from 'react-native-linear-gradient'
import { fontMain } from '../../styles/typography'

const styles = StyleSheet.create({
  container: {
    ...Buttons.buttonStandardContainer,
  },
  text: {
    ...Buttons.buttonStandardText,
    fontFamily: fontMain,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        marginTop: 3,
      },
    }),
  },
  disabledText: {
    opacity: 0.25,
  },
  gradientWrapper: {
    flex: 1,
  },
  buttonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  }
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

  const opacityDisabled = 0.25
  const opacityEnabled = 1
  const [opacityValue] = useState(
    new Animated.Value(disabled ? opacityDisabled : opacityDisabled),
  )
  const animateOpacity = (value: number) => {
    Animated.timing(opacityValue, {
      duration: 200,
      toValue: value,
      useNativeDriver: true,
    }).start()
  }

  useEffect(() => {
    animateOpacity(disabled ? opacityDisabled : opacityEnabled)
  }, [disabled])

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        ...styles.container,
        ...containerStyle,
      }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onButtonPress}
        testID={testID}
        style={styles.gradientWrapper}>
        <Animated.View
          style={[styles.buttonWrapper, { opacity: opacityValue }]}>
          <Text style={[styles.text, textStyle]}>{text}</Text>
        </Animated.View>
      </TouchableOpacity>
    </LinearGradient>
  )
}
