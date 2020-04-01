import React, { useEffect, useState, useRef } from 'react'
import { connect } from 'react-redux'

import { ThunkDispatch } from 'src/store'
import { Notification } from 'src/lib/notifications'
import { invokeDismiss, invokeInteract } from 'src/actions/notifications'
import { RootState } from 'src/reducers'
import { Wrapper } from 'src/ui/structure'
import { NotificationComponent } from '../components/notifications'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

export const NotificationContainer = (props: Props) => {
  const { activeNotification, onDismiss, onInteract } = props

  const notifComp = useRef<any>()
  const [notification, setNotification] = useState<Notification>()
  const isSticky = notification && !notification.dismiss

  return (
    <Wrapper heightless overlay>
      {notification &&
        <NotificationComponent
          notification={activeNotification}
          onSwipe={() => !isSticky && onDismiss(notification)}
          onPressDismiss={() => onDismiss(notification)}
          onPressInteract={() => onInteract(notification)}
          isSticky={isSticky}
        />
      }
    </Wrapper>
  )
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
