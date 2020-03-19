import React, { ReactNode, useEffect } from 'react'
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  StyleProp,
  ViewStyle
} from 'react-native'

import { backgroundDarkMain, backgroundLightMain } from 'src/styles/colors'
import { AppWrapState } from 'src/reducers/generic'
import { AppLoadingAndNotifications } from '../generic/appLoadingAndNotifications'
import { connect } from 'react-redux'
import { ThunkDispatch } from 'src/store'
import { registerAppWrapState, unregisterAppWrapState } from 'src/actions/generic'

interface Props extends Partial<AppWrapState>, ReturnType<typeof mapDispatchToProps> {
  testID?: string
  children: ReactNode
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  registerAppWrapState: (aws: AppWrapState) => dispatch(registerAppWrapState(aws))
  unregisterAppWrapState: (aws: AppWrapState) => dispatch(unregisterAppWrapState(aws))
})


/**
 * Wrapper
 *
 * The main use for this component is to have a full height and width component
 * that can be used in different components. It should be minimal in its style
 * so as to be reusable without constant overriding of its defaults.
 *
 * NOTE: If the wrapper is used with SafeAreaView, the padding style prop passed to
 * it will be ignored on iOS. https://github.com/facebook/react-native/issues/22211
 */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: backgroundLightMain,
    //...debug
  },
})


let statusBarHidden = 0
const WrapperContainer: React.FC<Props> = React.memo(props => {
  const WrapperView = !props.withoutSafeArea ? SafeAreaView : View

  const {
    loading,
    withoutSafeArea,
    dark,
    breathy,
    centered,
    overlay,
    withoutStatusBar,
    heightless
  } = props

  useEffect(() => {
    if (withoutStatusBar) {
      statusBarHidden += 1
      console.log('HIDING!')
      //StatusBar.setHidden(true)
      return () => {
        statusBarHidden -= 1
        setTimeout(() => {
          if (statusBarHidden === 0) {
            StatusBar.setHidden(false)
            console.log('UNHIDING!')
          }
        })
      }
    }

    return
  })

  const extraStyle: StyleProp<ViewStyle> = {
    // Note: StatusBar.currentHeight is not available on iOS
    paddingTop: withoutSafeArea ? 0 : StatusBar.currentHeight
  }
  if (dark) extraStyle.backgroundColor = backgroundDarkMain
  if (breathy) extraStyle.justifyContent = 'space-around'
  if (centered) extraStyle.alignItems = 'center'
  if (heightless) {
    extraStyle.height = 50
    extraStyle.backgroundColor = '#0f0'
  }

  if (overlay) {
    extraStyle.position = 'absolute'
    extraStyle.zIndex = 12 // good number
    extraStyle.backgroundColor = 'transparent'
    if (__DEV__ && dark) {
      throw new Error(
        "<Wrapper> can't be 'dark' and 'overlay' since overlays are transparent",
      )
    }
  }

  // @ts-ignore
  if (__DEV__ && props.style) {
    throw new Error(
      '<Wrapper> dont care bout yo style. ' +
      'Look at src/ui/structure/wrapper.tsx',
    )
  }

  return (<>
    <AppLoadingAndNotifications loading={!!loading} />
    <WrapperView testID={props.testID} style={[styles.wrapper, extraStyle]}>
      <StatusBar
        hidden={statusBarHidden > 0}
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={'transparent'}
        animated
        translucent
      />
      {props.children}
    </WrapperView>
  </>)
})

export const RealWrapper = WrapperContainer //connect(null, mapDispatchToProps)(WrapperContainer)

export const Wrapper = connect(null, mapDispatchToProps)((props: Props) => {
  useEffect(() => {
    const ref = props.registerWrapperState(props)
    return () => props.unregisterWrapperState(ref)
  })
  return props.children
}
