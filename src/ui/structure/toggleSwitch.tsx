import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { darkGrey } from '../../styles/colors'

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    width: 45,
    height: 30,
    borderRadius: 45,
  },
  toggle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  gradientWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
})

interface Props {
  value: boolean
  onToggle: () => void
  onGradient?: string[]
  offGradient?: string[]
  trackColor?: string
}

export const ToggleSwitch = (props: Props) => {
  const { onToggle, value, onGradient, offGradient, trackColor } = props

  const onGradientColors = onGradient || [
    'rgb(145, 25, 66)',
    'rgb(210, 45, 105)',
  ]
  const offGradientColors = offGradient || [
    'rgb(12, 12, 12)',
    'rgb(12, 12, 12)',
  ]
  const trackBackgroundColor = trackColor || darkGrey

  const offPosition = 2
  const onPosition = 17
  const switchPosition = value ? onPosition : offPosition

  const [positionValue] = useState(new Animated.Value(switchPosition))

  const onPress = () => {
    Animated.sequence([
      Animated.timing(positionValue, {
        toValue: value ? offPosition : onPosition,
        duration: 300,
      }),
    ]).start()
    onToggle()
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ ...styles.track, backgroundColor: trackBackgroundColor }}
    >
      <Animated.View
        style={{
          ...styles.toggle,
          transform: [{ translateX: positionValue }],
        }}
      >
        <LinearGradient
          style={styles.gradientWrapper}
          //NOTE locations prop breaks the gradient on iOS
          //locations={[0, 6]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={value ? onGradientColors : offGradientColors}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}
