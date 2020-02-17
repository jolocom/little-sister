import React, { useState } from 'react'
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { ScanIcon } from '../../../resources'

const styles = StyleSheet.create({
  circle: {
    borderRadius: 35,
    // NOTE zIndex behaves differently on iOS and android
    zIndex: Platform.select({
      ios: undefined,
      android: 3,
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    height: 0,
    zIndex: Platform.select({
      ios: 3,
      android: undefined,
    }),
  },
})

interface Props {
  navigateScanner: () => void
  buttonSize: number
  topMargin: number
  scale: number
}

/**
 * NOTE: scaling down the button proportionally to the SVG bar and aligning it
 */

export const InteractionButton = (props: Props) => {
  const { navigateScanner, buttonSize, topMargin, scale } = props
  const [scaleAnimationValue] = useState(new Animated.Value(1))

  const onPressIn = () => {
    Animated.timing(scaleAnimationValue, {
      duration: 80,
      toValue: 0.9,
    }).start()
  }

  const onPressOut = () => {
    Animated.timing(scaleAnimationValue, {
      duration: 60,
      toValue: 1,
    }).start()
  }

  return (
    <View style={styles.buttonWrapper}>
      <Animated.View
        style={{
          ...styles.circle,
          width: buttonSize,
          height: buttonSize,
          top: -topMargin,
          transform: [{ scale: scaleAnimationValue }],
        }}
      >
        <TouchableOpacity
          onPress={navigateScanner}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
          style={{ flex: 1 }}
        >
          <LinearGradient
            style={styles.gradient}
            colors={['rgb(210, 45, 105)', 'rgb(145, 25, 66)']}
          >
            <View style={{ transform: [{ scale }] }}>
              <ScanIcon />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}
