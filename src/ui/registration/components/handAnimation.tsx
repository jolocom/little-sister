import React, { useRef, useEffect } from 'react'
import { StyleSheet, View, Animated } from 'react-native'
import { HandIcon, SplashIcon } from 'src/resources/index'

interface Props {}

const styles = StyleSheet.create({
  handPosition: {
    // these values are to place the finger of the hand inside the 'splash'
    top: -29,
    left: 8,
  },
  splashPosition: {
    top: 0,
    left: 0,
  },
})

// TODO explain this better
export const usePulseForBoth = () => {
  // We need two changing values to use for the opacity,
  const handPV = useRef(new Animated.Value(0)).current
  const splashPV = useRef(new Animated.Value(0)).current
  // NOTE: cannot useState(true) because the value will get captured in the
  // pulse callback closure, so we need the indirection of useRef objects
  const isPulsingRef = useRef(true)

  // here we define how these values change
  // in parallel, they change in sync
  const pulse = () =>
    Animated.parallel([
      // these sequences are made of individual time frames, here I'm just
      // making a list of timings which each move to the next value
      Animated.sequence(
        [1, 0, 1, 0, 0, 1, 0].map(n =>
          Animated.timing(splashPV, { toValue: n }),
        ),
      ),
      Animated.sequence(
        [1, 1, 1, 0, 0, 1, 1].map(n => Animated.timing(handPV, { toValue: n })),
      ),
    ]).start(() => {
      // this must have itself as a callback to loop
      // but only do that if we are stillPulsing
      isPulsingRef.current && pulse()
    })

  // this is react hook magic, whatever functional component this is called in
  // will start the loop and clean up when it's lifetime is over
  useEffect(() => {
    pulse()
    return () => {
      isPulsingRef.current = false
    }
  })

  // return your shiny new looping animated values
  return { handPV, splashPV }
}

export const HandAnimationComponent: React.FC<Props> = props => {
  const { handPV, splashPV } = usePulseForBoth()

  return (
    <View>
      <Animated.View style={{ opacity: splashPV, ...styles.splashPosition }}>
        <SplashIcon />
      </Animated.View>
      <Animated.View style={{ opacity: handPV, ...styles.handPosition }}>
        <HandIcon />
      </Animated.View>
    </View>
  )
}
