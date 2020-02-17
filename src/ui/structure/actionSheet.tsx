import React, { useEffect, useState } from 'react'
import { Animated, Easing, LayoutChangeEvent, StyleSheet } from 'react-native'
import { Colors } from '../../styles'

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 'auto',
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.overflowBlack,
    zIndex: 2,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 22,
  },
})

interface Props {
  showSlide: boolean
}

export const ActionSheet: React.FC<Props> = props => {
  const { showSlide } = props
  // NOTE: default height is 9999 to make sure the view is hidden on first render
  const [viewHeight, setViewHeight] = useState(9999)
  const [animatedValue] = useState(new Animated.Value(0))

  useEffect(() => {
    if (showSlide) {
      animateShow()
    } else {
      animateHide()
    }
  }, [showSlide])

  const animateShow = () => {
    Animated.timing(animatedValue, {
      duration: 500,
      toValue: 1,
      easing: Easing.elastic(1),
    }).start()
  }

  const animateHide = () => {
    Animated.timing(animatedValue, {
      duration: 500,
      toValue: 0,
      useNativeDriver: true,
      easing: Easing.elastic(1),
    }).start()
  }

  const getDimensions = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout
    setViewHeight(height)
  }

  const interpolatedValue = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [viewHeight, 0],
  })

  return (
    <Animated.View
      style={{
        ...styles.wrapper,
        transform: [{ translateY: interpolatedValue }],
      }}
      onLayout={getDimensions}
    >
      {props.children}
    </Animated.View>
  )
}
