import * as React from 'react'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers'

import { LoadingSpinner } from './loadingSpinner'
import { Notifications } from '../notifications/containers/notifications'
import { Animated, StyleSheet } from 'react-native'
import { Colors } from 'src/styles'

interface Props extends ReturnType<typeof mapStateToProps> {}

const LOADING_SPINNER_FADE_DURATION = 150

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: Colors.white,
    position: 'absolute',
    // to cover things such as the qr code scanner
    zIndex: 1,
    flex: 1,
    width: '100%',
    height: '100%',
  },
})

const AppLoadingAndNotificationsContainer: React.FunctionComponent<
  Props
> = props => {
  const [loadingOpacity] = React.useState(new Animated.Value(0))
  const [showContainer, setShowContainer] = React.useState(false)
  const showRightNow = props.loading || showContainer

  const startAnimation = (shouldShow: boolean) => {
    setTimeout(() => {
      Animated.timing(loadingOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: LOADING_SPINNER_FADE_DURATION,
      }).start(done => {
        if (done.finished) setShowContainer(shouldShow)
      })
    })
  }

  if (props.loading && !showContainer) setShowContainer(true)
  if (props.loading != showContainer) startAnimation(props.loading)

  return props.loading || showRightNow ? (
    <Animated.View
      style={[
        showRightNow && styles.loadingContainer,
        { opacity: loadingOpacity },
      ]}
    >
      <LoadingSpinner />
    </Animated.View>
  ) : (
    <Notifications />
  )
}

const mapStateToProps = (state: RootState) => ({
  loading: state.generic.loading,
})

export const AppLoadingAndNotifications = connect(mapStateToProps)(
  AppLoadingAndNotificationsContainer,
)
