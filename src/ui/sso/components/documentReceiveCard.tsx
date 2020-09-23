import {
  StyleSheet,
  Animated,
  Vibration,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'
import {
  DOCUMENT_CARD_HEIGHT,
  DOCUMENT_CARD_WIDTH,
  DocumentCard,
} from '../../documents/components/documentCard'
import React, { useRef, useState, useEffect } from 'react'
import Interactable, { IDragEvent, ISnapEvent } from 'react-native-interactable'
import { Colors, Typefaces } from '../../../styles'
import { SignedCredentialWithMetadata } from '@jolocom/sdk/js/src/lib/interactionManager/types'

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  documentWrapper: {
    alignItems: 'center',
    borderRadius: 12,
  },
  infoWrapper: {
    width: '20%',
    height: '100%',
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    ...Typefaces.subtitle3,
    color: Colors.greyDark,
    textAlign: 'center',
  },
})

interface Props {
  onToggle: () => void
  selected: boolean
  offering: SignedCredentialWithMetadata
  invalid: boolean | undefined
}
export const DocumentReceiveCard = (props: Props) => {
  const { selected, offering, onToggle, invalid } = props
  const { type, renderInfo } = offering

  // The card is initially scaled to 0.8 from its default dimensions.
  const initScale = 0.8
  // When selected, the card scales back to its default dimensions
  const finScale = 1
  // Point where the card will snap to be selected, where 0 is the center of the screen
  const centerSnap = 0
  // Initial position of the card. Necessary as a snap point due to the imperative
  // snapping when the card is unselected e.g. instance.snapTo({}). Calc. as half of
  // the space left from scaling down.
  const leftSnap = -(DOCUMENT_CARD_WIDTH * (finScale - initScale)) / 2
  const cardMargin = 5
  // Initial margin for the scaled down card. Scaling down does not influence the layout
  // of the screen, so the negative margin allows cutting down the view's dimensions.
  // For the adjacent cards to appear with the correct @cardMargin, the space left after
  // scaling has to be removed for the views both above and below, hence the division to 4.
  const initMargin =
    -((finScale - initScale) * DOCUMENT_CARD_HEIGHT) / 4 - cardMargin

  const [scaleValue] = useState(new Animated.Value(initScale))
  const [translationX] = useState(new Animated.Value(leftSnap))
  const viewRef = useRef(null)

  // NOTE: Snapping to the initial position on mount due to some devices (Samsung S6 ??)
  // snapping incorrectly to the center
  useEffect(() => {
    // @ts-ignore
    viewRef.current.snapTo({ index: 0 })
  }, [])

  const onUnselect = () => {
    // @ts-ignore
    viewRef.current.snapTo({ index: 0 })
    setTimeout(() => {
      Animated.timing(scaleValue, {
        toValue: initScale,
        duration: 100,
      }).start(onToggle)
    }, 50)
  }

  const onSelect = () => {
    // @ts-ignore
    Vibration.vibrate(10)
    Animated.timing(scaleValue, {
      toValue: finScale,
      duration: 100,
    }).start(onToggle)
  }

  //NOTE: using @onDrag instead of @onSnap b/c on iOS the snap event is delayed
  const onDrag = ({ nativeEvent: { x } }: IDragEvent) => {
    //NOTE: 20 is subtracted from the centerSnap position to not trigger the @onSnap handler
    if (!selected && x > centerSnap - 20) {
      onSelect()
    } else if (selected) {
      onUnselect()
    }
  }

  //NOTE: @onSnap will fire if the animation/selection wasn't handled by @onDrag.
  const onSnap = (e: ISnapEvent) => {
    if (e.nativeEvent.index === 1 && selected) {
      onUnselect()
    }
  }

  const marginValue = scaleValue.interpolate({
    inputRange: [initScale, finScale],
    outputRange: [initMargin, cardMargin],
  })

  const opacityValue = translationX.interpolate({
    inputRange: [leftSnap, centerSnap],
    outputRange: [1, 0],
  })

  const translationValue = translationX.interpolate({
    inputRange: [leftSnap, 20],
    outputRange: [0, -40],
    extrapolateLeft: 'clamp',
  })

  const infoScale = translationX.interpolate({
    inputRange: [leftSnap, 20],
    outputRange: [1, 0.85],
    extrapolateLeft: 'clamp',
  })

  return (
    <View style={styles.wrapper}>
      {!invalid && (
        <Animated.View
          style={[
            styles.infoWrapper,
            {
              opacity: selected ? 0 : opacityValue,
              transform: [
                { translateX: translationValue },
                { scaleX: infoScale },
                { scaleY: infoScale },
              ],
            },
          ]}>
          <Text style={styles.infoText}>Pull to choose</Text>
        </Animated.View>
      )}
      <TouchableWithoutFeedback onPress={() => selected && onUnselect()}>
        <Interactable.View
          animatedValueX={translationX}
          ref={viewRef}
          horizontalOnly={true}
          snapPoints={[{ x: leftSnap }, { x: centerSnap }]}
          initialPosition={{ x: leftSnap }}
          dragEnabled={!invalid}
          onSnap={onSnap}
          onDrag={onDrag}
          // NOTE @clauxx this seems to make the stutter more rare
          dragToss={0}
          style={
            [
              styles.documentWrapper,
              {
                marginVertical: marginValue,
                transform: [{ scaleX: scaleValue }, { scaleY: scaleValue }],
              },
            ] as any
          }>
          <DocumentCard
            credentialType={type}
            renderInfo={renderInfo}
            invalid={invalid}
            shadow={true}
          />
        </Interactable.View>
      </TouchableWithoutFeedback>
    </View>
  )
}
