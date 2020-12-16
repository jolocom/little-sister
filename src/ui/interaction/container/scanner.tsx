import QRScanner from 'react-native-qrcode-scanner'
import React, { useEffect, useState, useRef } from 'react'
import {
  AppState,
  AppStateStatus,
  Platform,
  View,
  InteractionManager,
  BackHandler,
} from 'react-native'
import {
  NavigationInjectedProps,
  NavigationEventSubscription,
} from 'react-navigation'

import {
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
  check,
  Permission,
} from 'react-native-permissions'

import { ScannerComponent } from '../component/scanner'
import { NoPermissionComponent } from '../component/noPermission'
import { Colors } from 'src/styles'
import { Wrapper } from 'src/ui/structure'

interface Props extends NavigationInjectedProps {
  consumeToken: (jwt: string) => Promise<any>
  setDisableLock: (val: boolean) => void
}

const CAMERA_PERMISSION = Platform.select({
  android: PERMISSIONS.ANDROID.CAMERA,
  ios: PERMISSIONS.IOS.CAMERA,
}) as Permission

export const ScannerContainer: React.FC<Props> = props => {
  const { consumeToken, navigation } = props
  const [permission, setPermission] = useState<string>(RESULTS.UNAVAILABLE)
  const scannerRef = useRef<QRScanner>(null)
  const reactivate = () => scannerRef && scannerRef.current?.reactivate()
  const [showCamera, setShowCamera] = useState(true)
  const [shouldScan, setShouldScan] = useState(true)

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setShowCamera(false)
        return false
      },
    )

    let focusListener: NavigationEventSubscription | undefined
    let blurListener: NavigationEventSubscription | undefined

    if (navigation) {
      focusListener = navigation.addListener('didFocus', () => {
        setShowCamera(true)
        setShouldScan(true)
        reactivate()
      })

      blurListener = navigation.addListener('didBlur', () => {
        //setShowCamera(false)
        setShouldScan(false)
      })
    }
    checkCameraPermissions()

    return () => {
      blurListener && blurListener.remove()
      focusListener && focusListener.remove()
      backListener.remove()
    }
  }, [])

  const checkCameraPermissions = async () => {
    InteractionManager.runAfterInteractions(() => {
      check(CAMERA_PERMISSION).then(perm => {
        setPermission(perm)
        if (perm !== RESULTS.GRANTED && perm !== RESULTS.BLOCKED) {
          requestCameraPermission()
        }
      })
    })
  }

  const requestCameraPermission = async () => {
    // we disable the app lock while getting permissions so that user is not
    // locked out on returning to app
    props.setDisableLock(true)
    const permission = await request(CAMERA_PERMISSION)
    setPermission(permission)
    props.setDisableLock(false)
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

  let ret
  if (showCamera && permission === RESULTS.GRANTED) {
    ret = <ScannerComponent shouldScan={shouldScan} onScan={consumeToken} onScannerRef={scannerRef} />
  } else if (permission === RESULTS.UNAVAILABLE || !showCamera) {
    // TODO: maybe add a message here like "do you even camera?"
    ret = (
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: Colors.black065,
        }}
      />
    )
  } else {
    ret = <NoPermissionComponent onPressEnable={onEnablePermission} />
  }

  return (
    <Wrapper dark withoutSafeArea withoutStatusBar>
      {ret}
    </Wrapper>
  )
}

export const Scanner = ScannerContainer
