import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'

import { ThunkDispatch } from 'src/store'
import { Notification } from 'src/lib/notifications'
import { invokeDismiss, invokeInteract } from 'src/actions/notifications'
import { RootState } from 'src/reducers'
import {
  NotificationComponent,
  NotificationAnimationRef,
} from '../components/notifications'
import { Wrapper } from 'src/ui/structure'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

export const NotificationContainer = (props: Props) => {
  const { activeNotification, onDismiss, onInteract } = props

  const [notification, setNotification] = useState<Notification>()
  const animationRef = useRef<NotificationAnimationRef | null>(null)

  const isSticky = notification && !notification.dismiss

  useEffect(() => {
    if (!notification && activeNotification) {
      setNotification(activeNotification)
      animationRef.current?.showNotification().start()
    } else if (notification && !activeNotification) {
      animationRef.current?.hideNotification().start(() => {
        setNotification(undefined)
      })
    } else if (
      activeNotification &&
      notification &&
      activeNotification.id !== notification.id
    ) {
      animationRef.current?.hideNotification().start(() => {
        setNotification(activeNotification)

        /** NOTE @mnzaki * this should be triggered from the (!notif && active)
        case * normally if the active notification is nulled first, but * it is
        not because of animation flicker. If this causes issues * later, add an
        animation queue and only trigger new ones after * previous ones are over
        in general and not for this specific case */
        animationRef.current?.showNotification().start()
      })
    }
  }, [notification, activeNotification, animationRef])

  return activeNotification || notification ? (
    <Wrapper heightless dark overlay withoutSafeArea>
      <NotificationComponent
        ref={animationRef}
        notification={notification}
        onSwipe={() => !isSticky && notification && onDismiss(notification)}
        onPressDismiss={() => notification && onDismiss(notification)}
        onPressInteract={() => notification && onInteract(notification)}
        isSticky={isSticky}
      />
    </Wrapper>
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
