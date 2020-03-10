import React, { useEffect, useState } from 'react'
import {
  Animated,
  AppState,
  AppStateStatus,
  Platform,
  View,
} from 'react-native'
import {
  NavigationEventSubscription,
  NavigationScreenProps,
} from 'react-navigation'
/* TODO: When using the latest react-native-permissions version, remove this dependency,
 since there is already a cross-platform openSettings method */
import { appDetailsSettings } from 'react-native-android-open-settings'
// TODO: using v1.2.1. When upgrading to RN60, use the latest version.
import Permissions, { Status } from 'react-native-permissions'
import { ScannerComponent } from '../component/scanner'
import { NoPermissionComponent } from '../component/noPermission'
import { JolocomLib } from 'jolocom-lib'
import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Colors } from '../../../styles'

interface Props extends NavigationScreenProps {
  onScannerSuccess: (interactionToken: JSONWebToken<JWTEncodable>) => void
}

const CAMERA_PERMISSION = 'camera'

enum RESULTS {
  AUTHORIZED = 'authorized',
  RESTRICTED = 'restricted',
}

const IS_IOS = Platform.OS === 'ios'

export const ScannerContainer = (props: Props) => {
  const { onScannerSuccess, navigation } = props
  const [reRenderKey, setRenderKey] = useState(Date.now())
  const [permission, setPermission] = useState<Status>(RESULTS.RESTRICTED)
  const [isCameraReady, setCameraReady] = useState(false)
  const [isTorch, setTorch] = useState(false)
  const [isError, setError] = useState(false)
  const [colorAnimationValue] = useState(new Animated.Value(0))
  const [textAnimationValue] = useState(new Animated.Value(0))

  useEffect(() => {
    let focusListener!: NavigationEventSubscription
    if (navigation) {
      focusListener = navigation.addListener('willFocus', () => {
        // NOTE: the re-render and the re-mount should only fire during the willFocus event
        setTimeout(() => {
          setRenderKey(Date.now())
        }, 1000)
      })
    }

    requestCameraPermission().then(() => {
      setTimeout(() => setCameraReady(true), 200)
    })

    return focusListener.remove
  }, [])

  const requestCameraPermission = async () => {
    const permission = await Permissions.request(CAMERA_PERMISSION)
    setPermission(permission)
  }

  const openSettings = () => {
    const listener = async (state: AppStateStatus) => {
      if (state === 'active') {
        AppState.removeEventListener('change', listener)
        await requestCameraPermission()
      }
    }

    AppState.addEventListener('change', listener)

    try {
      const openPlatformSettings = Platform.select({
        ios: Permissions.openSettings,
        android: appDetailsSettings,
      })
      openPlatformSettings()
    } catch (e) {
      AppState.removeEventListener('change', listener)
    }
  }

  const onEnablePermission = async () => {
    if (IS_IOS) {
      openSettings()
    } else {
      if (permission === RESULTS.RESTRICTED) {
        openSettings()
      } else {
        await requestCameraPermission()
      }
    }
  }

  const animateColor = () =>
    Animated.sequence([
      Animated.timing(colorAnimationValue, {
        toValue: 1,
        duration: 300,
      }),
      Animated.timing(colorAnimationValue, {
        toValue: 0,
        delay: 400,
        duration: 300,
      }),
    ])

  const animateText = () =>
    Animated.sequence([
      Animated.timing(textAnimationValue, {
        toValue: 1,
        duration: 200,
      }),
      Animated.timing(textAnimationValue, {
        toValue: 0,
        delay: 1200,
        duration: 500,
      }),
    ])

  const parseJWT = (jwt: string) => {
    try {
      const interactionToken = JolocomLib.parse.interactionToken.fromJWT(jwt)
      onScannerSuccess(interactionToken)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(true)
        Animated.parallel([animateColor(), animateText()]).start(() => {
          setError(false)
        })
      }
    }
  }

  return permission === RESULTS.AUTHORIZED ? (
    isCameraReady ? (
      <ScannerComponent
        reRenderKey={reRenderKey}
        onScan={parseJWT}
        isTorchPressed={isTorch}
        onPressTorch={(state: boolean) => setTorch(state)}
        isError={isError}
        colorAnimationValue={colorAnimationValue}
        textAnimationValue={textAnimationValue}
      />
    ) : (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: Colors.black065,
        }}
      />
    )
  ) : (
    <NoPermissionComponent onPressEnable={onEnablePermission} />
  )
}
