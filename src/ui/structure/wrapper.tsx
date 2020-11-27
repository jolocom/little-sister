import React, { ReactNode, useEffect } from 'react'
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  StyleProp,
  ViewStyle,
  AppStateStatus,
  Platform,
} from 'react-native'

import { backgroundDarkMain, backgroundLightMain } from 'src/styles/colors'
import { AppWrapConfig, pickAppWrapConfigAttrs } from 'src/reducers/generic'
import { AppLoadingAndNotifications } from '../generic/appLoadingAndNotifications'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'src/store'
import {
  registerAppWrapConfig,
  unregisterAppWrapConfig,
} from 'src/actions/generic'
import { RootState } from 'src/reducers'
import { useAppState } from '../deviceauth/hooks/useAppState'
import { genericActions, scheduleOfflineNotification } from 'src/actions'
import { Colors } from '../deviceauth/colors'
import strings from 'src/locales/strings'

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  registerProps: (props: Props) =>
    dispatch(registerAppWrapConfig(pickAppWrapConfigAttrs(props))),
  unregisterPropsByRef: (ref: ReturnType<typeof registerAppWrapConfig>) =>
    dispatch(unregisterAppWrapConfig(ref.value)),
})

const mapStateToAppWrapProps = (state: RootState) => state.generic.appWrapConfig
const mapDispatchToAppWrapProps = (dispatch: ThunkDispatch) => ({
  lockApp: () => dispatch(genericActions.lockApp()),
  scheduleOfflineNotification: () =>
    dispatch(
      scheduleOfflineNotification(
        strings.WITHOUT_AN_ACTIVE_CONNECTION_SOME_FEATURES_MAY_BE_UNAVAILABLE,
      ),
    ),
})

interface Props
  extends Partial<AppWrapConfig>,
    ReturnType<typeof mapDispatchToProps> {
  readonly style?: ViewStyle
  readonly withoutSafeArea?: boolean
  readonly dark?: boolean
  readonly secondaryDark?: boolean
  readonly breathy?: boolean
  readonly centered?: boolean
  readonly overlay?: boolean
  readonly heightless?: boolean
  readonly testID?: string
  children: ReactNode
}

interface AppWrapProps
  extends AppWrapConfig,
    ReturnType<typeof mapDispatchToAppWrapProps>,
    ReturnType<typeof mapStateToAppWrapProps> {
  children: ReactNode
}

/**
 * Wrapper
 *
 * The main use for this component is to have a full height and width component
 * that can be used in different components. It should be minimal in its style
 * so as to be reusable without constant overriding of its defaults.
 *
 * NOTE: If the wrapper is used with SafeAreaView, the padding style prop passed to
 * it will be ignored on iOS. https://github.com/facebook/react-native/issues/22211
 *
 * Wrapper props:
 * withoutSafeArea    don't pad for SafeArea
 * dark               use dark background and status bar
 * secondaryDark      lighter background and status bar
 * breathy            justify with 'space-around', for a breathy look-n-feel
 * centered           alignItems 'center'
 * overlay            absolutely positioned transpare overlay
 * heightless         set height to 0 instead of default 100%
 * style              custom styles for the wrapping view
 * testID             ID/label for use in tests
 */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: backgroundLightMain,
  },
})

let statusBarHidden = 0
const AppWrapContainer: React.FC<AppWrapProps> = props => {
  const {
    dark,
    secondaryDark,
    loading,
    withoutStatusBar,
    lockApp,
    // scheduleOfflineNotification,
  } = props
  // const { isConnected } = useNetInfo()

  // TODO We need a way to delay this notification, currently it would show up
  // during the splash screen. Also, on IOS the application starts with no
  // internet access (therefore the notification is always scheduled).
  // useEffect(() => {
  //   !isConnected && scheduleOfflineNotification()
  // }, [isConnected])

  useEffect(() => {
    // TODO @mnzaki
    // this is overengineered to allow for nesting <Wrapper>
    // instances that have conflicting StatusBar desires
    // see notion:spaces/mnzaki
    if (withoutStatusBar && Platform.OS !== 'ios') {
      statusBarHidden += 1
      StatusBar.setHidden(true)
      return () => {
        statusBarHidden -= 1
        if (statusBarHidden === 0) {
          StatusBar.setHidden(false)
        }
      }
    }

    return
  }, [withoutStatusBar])

  useAppState((appState: AppStateStatus, nextAppState: AppStateStatus) => {
    /* if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
     *   lockApp()
     * } */

    if (
      (Platform.OS === 'ios' &&
        appState.match(/background/) &&
        nextAppState.match(/inactive|active/)) ||
      (Platform.OS === 'android' &&
        appState.match(/active/) &&
        nextAppState.match(/inactive|background/))
    ) {
      lockApp()
    }
  })

  return (
    <>
      <StatusBar
        //hidden={statusBarHidden > 0}
        barStyle={dark || secondaryDark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
        animated
        translucent
      />

      <AppLoadingAndNotifications loading={!!loading} />
      {props.children}
    </>
  )
}

export const AppWrap = connect(
  mapStateToAppWrapProps,
  mapDispatchToAppWrapProps,
)(AppWrapContainer)

export const Wrapper = React.memo(
  connect(
    null,
    mapDispatchToProps,
  )((props: Props) => {
    useEffect(() => {
      const ref = props.registerProps(props)
      return () => {
        props.unregisterPropsByRef(ref)
      }
    }, [])

    const WrapperView = !props.withoutSafeArea ? SafeAreaView : View

    const {
      withoutSafeArea,
      dark,
      breathy,
      centered,
      overlay,
      heightless,
      withoutStatusBar,
      style,
      secondaryDark,
    } = props

    const extraStyle: StyleProp<ViewStyle> = {
      // Note: StatusBar.currentHeight is not available on iOS
      paddingTop: withoutSafeArea ? 0 : StatusBar.currentHeight,
    }
    if (withoutStatusBar) extraStyle.paddingTop = 0
    if (dark) extraStyle.backgroundColor = backgroundDarkMain
    if (secondaryDark) extraStyle.backgroundColor = Colors.mainBlack
    if (breathy) extraStyle.justifyContent = 'space-around'
    if (centered) extraStyle.alignItems = 'center'
    if (heightless) {
      extraStyle.height = 'auto'
      extraStyle.backgroundColor = '#0f0'
    }

    if (overlay) {
      extraStyle.position = 'absolute'
      extraStyle.zIndex = 12 // good number
      extraStyle.backgroundColor = 'transparent'
    }

    if (style) Object.assign(extraStyle, style)

    return (
      <>
        <WrapperView testID={props.testID} style={[styles.wrapper, extraStyle]}>
          {props.children}
        </WrapperView>
      </>
    )
  }),
)
