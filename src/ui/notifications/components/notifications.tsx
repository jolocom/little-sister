import React, { useState, useEffect } from 'react'
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  PanResponderGestureState,
} from 'react-native'
import { fontMain } from '../../../styles/typography'
import { black, white, yellowError } from '../../../styles/colors'
import { Notification, NotificationType } from '../../../lib/notifications'
import { AnyAction } from 'redux'
import { BP } from '../../../styles/breakpoints'
import { SwipeUpWrapper } from 'src/ui/structure/swipeUpWrapper'
import { debug } from 'src/styles/presets'

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(0,0,0,0.9)',
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
  notification: Notification
  onPressDismiss: () => void | boolean | AnyAction | Promise<void | AnyAction>
  onPressInteract: () => void | boolean | AnyAction | Promise<void | AnyAction>
  isSticky: boolean | undefined
  ref?: any
  onSwipe?: () => void
}

export const NotificationComponent: React.FC<Props> = ({
  notification: activeNotification,
  onPressInteract,
  isSticky,
  ref,
  onSwipe
}) => {
  const isWarning = notification?.type === NotificationType.warning
  const hasButton = notification?.interact
  const [buttonWidth, setButtonWidth] = useState(0)
  const [notificationDimensions, setNotificationDimensions] = useState({
    width: 300,
    height: 100,
  })
  const [animatedValue] = useState<Animated.Value>(
    new Animated.Value(-notificationDimensions.height),
  )

  const onLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout
    setNotificationDimensions({ width, height })
  }

  const onButtonLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    setButtonWidth(width)
  }

  const onSwipeUp = (state: PanResponderGestureState) => {
    // NOTE: disables swiping on the side of the interaction button.
    const buttonMargin = notificationDimensions.width - buttonWidth
    const isButtonAreaSwipe = state.x0 > buttonMargin
    if (hasButton && !isButtonAreaSwipe && onSwipe) onSwipe()
  }

  const [notification, setNotification] = useState(activeNotification)

  const showNotification = () =>
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    })
  const hideNotification = () =>
    Animated.timing(animatedValue, {
      toValue: -notificationDimensions.height,
      duration: 300,
      useNativeDriver: true,
    })

  useEffect(() => {
    if (!notification && activeNotification) {
      setNotification(activeNotification)
      showNotification().start()
    } else if (notification && !activeNotification) {
      hideNotification().start(() => {
        setNotification(undefined)
      })
    } else if (
      activeNotification &&
      notification &&
      activeNotification.id !== notification.id
    ) {
      //check this
      hideNotification().start(() => {
        setNotification(activeNotification)

        /** NOTE @mnzaki
         * this should be triggered from the (!notif && active) case
         * normally if the active notification is nulled first, but
         * it is not because of animation flicker. If this causes issues
         * later, add an animation queue and only trigger new ones after
         * previous ones are over in general and not for this specific case
         */
        showNotification().start()
      })
    }
  }, [activeNotification, notification])


  return (
      <Animated.View
        onLayout={onLayout}
        style={[
          debug,
          styles.wrapper,
          { transform: [{ translateY: animatedValue }] },
        ]}
      >
        <SwipeUpWrapper onSwipeUp={onSwipeUp}>
          <TouchableOpacity
            activeOpacity={isSticky ? 0.7 : 1}
            {...((isSticky || !hasButton) && {
              style: styles.bottomPadding,
            })}
            {...(isSticky && { onPress: onPressInteract })}
          >
            <Text
              style={{
                ...styles.title,
                ...(!hasButton && styles.centeredText),
                color: isSticky ? yellowError : white,
              }}
            >
              {notification.title}
            </Text>
            <Text
              style={{
                ...styles.message,
                ...(!hasButton && styles.centeredText),
              }}
            >
              {notification.message}
            </Text>
            {!isSticky && hasButton && (
              <View style={styles.buttonSection}>
                {hasButton && (
                  <TouchableOpacity
                    onLayout={onButtonLayout}
                    style={styles.buttonWrapper}
                    onPress={onPressInteract}
                  >
                    <View
                      style={{
                        ...styles.button,
                        ...(isWarning ? styles.warningButton : styles.infoButton),
                      }}
                    >
                      <Text
                        style={{
                          ...styles.buttonText,
                          color: isWarning ? black : white,
                        }}
                      >
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
}
