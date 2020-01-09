import React, { useEffect, useState } from 'react'
import { NotificationComponent } from '../components/notifications'
import { Animated, LayoutChangeEvent, StatusBar, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { Notification } from '../../../lib/notifications'
import { ThunkDispatch } from '../../../store'
import { invokeDismiss, invokeInteract } from '../../../actions/notifications'
import GestureRecognizer from 'react-native-swipe-gestures'
import { RootState } from '../../../reducers'

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
  },
})

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

export const NotificationContainer = (props: Props) => {
  const { activeNotification, onDismiss, onInteract } = props

  const [notification, setNotification] = useState<Notification>()
  const [notificationHeight, setNotificationHeight] = useState(100)
  const [animatedValue] = useState<Animated.Value>(
    new Animated.Value(-notificationHeight),
  )
  const isSticky = notification && !notification.dismiss

  useEffect(() => {
    console.log(activeNotification)
    if (!notification && activeNotification) {
      setNotification(activeNotification)
      showNotification().start()
    } else if (notification && !activeNotification) {
      hideNotification().start(() => {
        setNotification(undefined)
        setNotificationHeight(100)
      })
    } else if (
      activeNotification &&
      notification &&
      activeNotification.id !== notification.id
    ) {
      //fix this
      hideNotification().start(() => {
        setNotification(activeNotification)
        showNotification().start()
      })
    }
  }, [activeNotification, notification])

  const showNotification = () => {
    StatusBar.setBarStyle('light-content')
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    })
  }

  const hideNotification = () => {
    StatusBar.setBarStyle('default')
    return Animated.timing(animatedValue, {
      toValue: -notificationHeight,
      duration: 300,
      useNativeDriver: true,
    })
  }

  const onLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout
    setNotificationHeight(height)
  }

  const onSwipe = (gestureName: string) => {
    if (notification && !isSticky && gestureName !== 'SWIPE_DOWN') {
      console.log('swiped')
      onDismiss(notification)
    }
  }

  return notification ? (
    <Animated.View
      onLayout={onLayout}
      style={{
        ...styles.wrapper,
        transform: [{ translateY: animatedValue }],
      }}
    >
      <GestureRecognizer onSwipe={onSwipe}>
        <NotificationComponent
          onPressDismiss={() => onDismiss(notification)}
          onPressInteract={() => onInteract(notification)}
          notification={notification}
          isSticky={isSticky}
        />
      </GestureRecognizer>
    </Animated.View>
  ) : null
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  onDismiss: (notification: Notification) =>
    dispatch(invokeDismiss(notification)),
  onInteract: (notification: Notification) =>
    dispatch(invokeInteract(notification)),
})

const mapStateToProps = (state: RootState) => ({
  activeNotification: state.notifications.active,
})

export const Notifications = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationContainer)
