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
  NavigationInjectedProps
} from 'react-navigation'

import { PERMISSIONS, RESULTS, request, openSettings, check, Permission } from 'react-native-permissions'

import { ScannerComponent } from '../component/scanner'
import { NoPermissionComponent } from '../component/noPermission'
import { JolocomLib } from 'jolocom-lib'
import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { Colors } from 'src/styles'

interface Props extends NavigationInjectedProps {
  onScannerSuccess: (interactionToken: JSONWebToken<JWTEncodable>) => void
}

const CAMERA_PERMISSION = Platform.select({
  android: PERMISSIONS.ANDROID.CAMERA,
  ios: PERMISSIONS.IOS.CAMERA
}) as Permission

export const ScannerContainer: React.FC<Props> = (props) => {
  const { onScannerSuccess, navigation } = props
  const [reRenderKey, setRenderKey] = useState(Date.now())
  const [permission, setPermission] = useState<string>(RESULTS.UNAVAILABLE)
  const [isTorch, setTorch] = useState(false)
  const [isError, setError] = useState(false)
  const [colorAnimationValue] = useState(new Animated.Value(0))
  const [textAnimationValue] = useState(new Animated.Value(0))
  const [scannerRef, setScannerRef] = useState(null)

  // NOTE: this is needed because QRScanner behaves weirdly when the screen is
  // remounted....
  if (scannerRef) scannerRef.reactivate()

  const rerender = () => {
    setRenderKey(Date.now())
    if (scannerRef) scannerRef.reactivate()
  }

  useEffect(() => {
    let listeners: NavigationEventSubscription[] = []
    if (navigation) {
      listeners.push(navigation.addListener('didFocus', () => {
        rerender()
        checkCameraPermissions()
      }))
    } else {
      checkCameraPermissions()
    }

    return () => listeners.forEach(l => l.remove())
  }, [])

  const checkCameraPermissions = async () => {
    return check(CAMERA_PERMISSION).then(perm => {
      setPermission(perm)
      if (perm !== RESULTS.GRANTED && perm !== RESULTS.BLOCKED) {
        requestCameraPermission()
      }
    })
  }

  const requestCameraPermission = async () => {
    const permission = await request(CAMERA_PERMISSION)
    setPermission(permission)
  }

  const tryOpenSettings = () => {
    const listener = async (state: AppStateStatus) => {
      if (state === 'active') {
        AppState.removeEventListener('change', listener)
        await requestCameraPermission()
      }
    }

    AppState.addEventListener('change', listener)

    try {
      openSettings()
    } catch (e) {
      AppState.removeEventListener('change', listener)
    }
  }

  const onEnablePermission = async () => {
    if (permission === RESULTS.BLOCKED) {
      tryOpenSettings()
    } else {
      await requestCameraPermission()
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

  const onScan = (jwt: string) => {
    try {
      const interactionToken = JolocomLib.parse.interactionToken.fromJWT(jwt)
      onScannerSuccess(interactionToken)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(true)
        Animated.parallel([animateColor(), animateText()]).start(() => {
          setError(false)
          rerender()
        })
      }
    }
  }

  if (permission === RESULTS.GRANTED) {
    return (
      <ScannerComponent
        reRenderKey={reRenderKey}
        onScan={onScan}
        onScannerRef={r => setScannerRef(r)}
        isTorchPressed={isTorch}
        onPressTorch={(state: boolean) => setTorch(state)}
        isError={isError}
        colorAnimationValue={colorAnimationValue}
        textAnimationValue={textAnimationValue}
      />
    )
  } else if (permission === RESULTS.UNAVAILABLE) {
    // TODO: maybe add a message here like "do you even camera?"
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: Colors.black065,
        }}
      />
    )
  } else {
    return <NoPermissionComponent onPressEnable={onEnablePermission} />
  }
}
