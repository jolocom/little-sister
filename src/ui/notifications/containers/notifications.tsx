import React, { useEffect, useState, useRef } from 'react'
import { NotificationComponent } from '../components/notifications'
import { connect } from 'react-redux'
import { Notification } from '../../../lib/notifications'
import { ThunkDispatch } from '../../../store'
import { invokeDismiss, invokeInteract } from '../../../actions/notifications'
import { RootState } from '../../../reducers'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

export const NotificationContainer = (props: Props) => {
  const { activeNotification, onDismiss, onInteract } = props

  const notifComp = useRef<any>()
  const [notification, setNotification] = useState<Notification>()
  const isSticky = notification && !notification.dismiss

  return notification ? (
    <NotificationComponent
      notification={activeNotification}
      onSwipe={() => !isSticky && onDismiss(notification)}
      onPressDismiss={() => onDismiss(notification)}
      onPressInteract={() => onInteract(notification)}
      isSticky={isSticky}
    />
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
