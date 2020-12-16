import React, { useEffect, useState } from 'react'
import { Animated, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native'
import { Colors } from '../../styles'
import { overflowBlack } from '../../styles/colors'

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 'auto',
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.overflowBlack,
    zIndex: 2,
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
})

interface Props {
  showSlide: boolean
  customStyles?: ViewStyle
}

export const ActionSheet: React.FC<Props> = props => {
  const { showSlide, customStyles = {} } = props
  // NOTE: default height is 9999 to make sure the view is hidden on first render
  const [viewHeight, setViewHeight] = useState(9999)
  const [animatedValue] = useState(new Animated.Value(0))

  useEffect(() => {
    setTimeout(() => {
      if (showSlide) {
        animate(1)
      } else {
        animate(0)
      }
    }, 400)
    return () => animate(0)
  }, [showSlide])

  const animate = (toValue: number) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 200,
      useNativeDriver: true,
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
        ...customStyles,
        transform: [{ translateY: interpolatedValue }],
      }}
      onLayout={getDimensions}
    >
      {props.children}
      <View
        style={{
          position: 'absolute',
          bottom: -300,
          height: 300,
          left: 0,
          right: 0,
          backgroundColor: overflowBlack,
        }}
      />
    </Animated.View>
  )
}
