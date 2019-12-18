import React from 'react'
import { Notification } from './notifications'
import { connect } from 'react-redux'
import { RootState } from '../../../reducers'
import { compose } from 'redux'
import { NavigationScreenProps } from 'react-navigation'

interface Props
  extends NavigationScreenProps,
    ReturnType<typeof mapStateToProps> {}

const withNotificationsHOC = <P extends object>(
  Component: React.ComponentType<Props>,
) =>
  class NotificationsHOC extends React.Component<Props> {
    public render() {
      const { activeNotification } = this.props
      const isSticky =
        activeNotification && activeNotification.dismiss === false
      return (
        <React.Fragment>
          <Component {...(this.props as Props)} />
          {!isSticky && (
            <Notification activeNotification={activeNotification} />
          )}
        </React.Fragment>
      )
    }
  }

const mapStateToProps = (state: RootState) => ({
  activeNotification: state.notifications.active,
})

export const withNotification = compose(
  connect(
    mapStateToProps,
    null,
  ),
  withNotificationsHOC,
)