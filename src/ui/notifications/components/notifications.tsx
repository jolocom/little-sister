import React, { useState, MutableRefObject, useRef } from 'react'
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponderGestureState,
  StatusBar,
} from 'react-native'
import { fontMain } from '../../../styles/typography'
import { black, white, yellowError } from '../../../styles/colors'
import { Notification, NotificationType } from '../../../lib/notifications'
import { AnyAction } from 'redux'
import { BP } from '../../../styles/breakpoints'
import { SwipeUpWrapper } from 'src/ui/structure/swipeUpWrapper'

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    //FIXME should be handled by the Wrapper, but it messes with the notification's dimensions
    paddingTop: StatusBar.currentHeight,
  },
  bottomPadding: {
    paddingBottom: BP({
      small: 12,
      medium: 12,
      large: 15,
    }),
  },
  title: {
    // TODO: replace with TTCommons Medium
    fontFamily: fontMain,
    fontSize: BP({
      small: 16,
      medium: 16,
      large: 18,
    }),
    marginTop: BP({
      small: 12,
      medium: 16,
      large: 20,
    }),
    marginHorizontal: 20,
  },
  message: {
    fontFamily: fontMain,
    fontSize: BP({
      small: 12,
      medium: 12,
      large: 14,
    }),
    color: white,
    marginHorizontal: 20,
    marginTop: 8,
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    paddingVertical: BP({
      large: 15,
      medium: 12,
      small: 12,
    }),
    minWidth: 100,
  },
  button: {
    height: 27,
    borderRadius: 6.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
  },
  buttonText: {
    // TODO change to TTCommons-Bold
    fontFamily: fontMain,
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningButton: {
    backgroundColor: '#f3c61c',
  },
  infoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: white,
  },
})

interface Props {
  notification: Notification | undefined
  onPressDismiss: () => void | boolean | AnyAction | Promise<void | AnyAction>
  onPressInteract: () => void | boolean | AnyAction | Promise<void | AnyAction>
  isSticky: boolean | undefined
  onSwipe?: () => void
}

export interface NotificationAnimationRef {
  showNotification: () => Animated.CompositeAnimation
  hideNotification: () => Animated.CompositeAnimation
}

export const NotificationComponent = React.forwardRef<
  NotificationAnimationRef,
  Props
>(({ notification, onPressInteract, isSticky, onSwipe }, ref) => {
  const [buttonWidth, setButtonWidth] = useState(0)
  const [notificationDimensions, setNotificationDimensions] = useState({
    width: 300,
    height: 100,
  })
  const animatedValue = useRef<Animated.Value>(
    new Animated.Value(-notificationDimensions.height),
  ).current

  const isWarning = notification?.type === NotificationType.warning
  const hasButton = notification?.interact

  const onLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout
    setNotificationDimensions({ width, height })
  }

  const onButtonLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    setButtonWidth(width)
  }

  // NOTE: disables swiping on the side of the interaction button.
  // If no interaction button, the whole notification is swipable
  // TODO: use actual gestures instead of "swiping"
  const onSwipeUp = (state: PanResponderGestureState) => {
    const buttonMargin = notificationDimensions.width - buttonWidth
    const isButtonArea = state.x0 > buttonMargin
    if (onSwipe && ((hasButton && !isButtonArea) || !hasButton)) onSwipe()
  }

  /**
   ** Assings methods to the component ref to imperatively control the notification animations
   ** FIXME
   ** https://stackoverflow.com/questions/55677600/typescript-how-to-pass-object-is-possibly-null-error
   ** https://stackoverflow.com/questions/58017215/what-typescript-type-do-i-use-with-useref-hook-when-setting-current-manually
   **/
  if (ref) {
    ;(ref as MutableRefObject<NotificationAnimationRef>).current = {
      showNotification: () =>
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      hideNotification: () =>
        Animated.timing(animatedValue, {
          toValue: -notificationDimensions.height,
          duration: 300,
          useNativeDriver: true,
        }),
    }
  }

  return (
    //TODO fix types
    <Animated.View
      onLayout={onLayout}
      style={[styles.wrapper, { transform: [{ translateY: animatedValue }] }]}>
      <SwipeUpWrapper onSwipeUp={onSwipeUp}>
        <TouchableOpacity
          activeOpacity={isSticky ? 0.7 : 1}
          {...((isSticky || !hasButton) && {
            style: styles.bottomPadding,
          })}
          {...(isSticky && { onPress: onPressInteract })}>
          <Text
            style={{
              ...styles.title,
              ...(!hasButton && styles.centeredText),
              color: isSticky ? yellowError : white,
            }}>
            {notification?.title}
          </Text>
          <Text
            style={{
              ...styles.message,
              ...(!hasButton && styles.centeredText),
            }}>
            {notification?.message}
          </Text>
          {!isSticky && hasButton && (
            <View style={styles.buttonSection}>
              {hasButton && (
                <TouchableOpacity
                  onLayout={onButtonLayout}
                  style={styles.buttonWrapper}
                  onPress={onPressInteract}>
                  <View
                    style={{
                      ...styles.button,
                      ...(isWarning ? styles.warningButton : styles.infoButton),
                    }}>
                    <Text
                      style={{
                        ...styles.buttonText,
                        color: isWarning ? black : white,
                      }}>
                      {notification?.interact?.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </SwipeUpWrapper>
    </Animated.View>
  )
})
