import React, { ReactNode } from 'react'
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  StyleProp,
  ViewStyle
} from 'react-native'

import { backgroundDarkMain, backgroundLightMain } from 'src/styles/colors'

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
  },
})

interface Props {
  testID?: string
  children: ReactNode
  withoutSafeArea?: boolean
  withoutStatusBar?: boolean
  dark?: boolean
  breathy?: boolean
  centered?: boolean
  overlay?: boolean
}

export const Wrapper: React.FC<Props> = props => {
  const WrapperView = !props.withoutSafeArea ? SafeAreaView : View

  const {
    withoutSafeArea,
    dark,
    breathy,
    centered,
    overlay,
    withoutStatusBar,
  } = props
  const extraStyle: StyleProp<ViewStyle> = {
    // Note: StatusBar.currentHeight is not available on iOS
    paddingTop: withoutSafeArea ? 0 : StatusBar.currentHeight
  }
  if (dark) extraStyle.backgroundColor = backgroundDarkMain
  if (breathy) extraStyle.justifyContent = 'space-around'
  if (centered) extraStyle.alignItems = 'center'
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

  const statusBar = !overlay ? (
    <StatusBar
      hidden={!!withoutStatusBar}
      barStyle={dark ? 'light-content' : 'dark-content'}
      backgroundColor={'transparent'}
      animated
      translucent
    />
  ) : null

  return (
    <WrapperView testID={props.testID} style={[styles.wrapper, extraStyle]}>
      {statusBar}
      {props.children}
    </WrapperView>
  )
}
