import React from 'react'
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  View,
} from 'react-native'

interface Props {
  onSwipeUp: (gestureState: PanResponderGestureState) => void
}

export const SwipeUpWrapper: React.FC<Props> = props => {
  const { onSwipeUp } = props

  const swipeConfig = {
    isClickThreshold: 5,
    directionOffset: 110,
  }

  const isGestureClick = (gestureState: PanResponderGestureState) =>
    Math.abs(gestureState.dx) < swipeConfig.isClickThreshold &&
    Math.abs(gestureState.dy) < swipeConfig.isClickThreshold

  const isSwipeUp = (gestureState: PanResponderGestureState) =>
    gestureState.dy < 0 &&
    Math.abs(gestureState.dx) < swipeConfig.directionOffset

  const shouldSetResponder = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => event.nativeEvent.touches.length === 1 && !isGestureClick(gestureState)

  const responderEnd = (
    event: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    if (isSwipeUp(gestureState)) {
      onSwipeUp(gestureState)
    }
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: shouldSetResponder,
    onMoveShouldSetPanResponder: shouldSetResponder,
    onPanResponderRelease: responderEnd,
    onPanResponderTerminate: responderEnd,
  })

  return (
    <View {...props} {...panResponder.panHandlers}>
      {props.children}
    </View>
  )
}
