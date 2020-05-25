import QRScanner from 'react-native-qrcode-scanner'
import React, { useEffect, useState } from 'react'
import {
  AppState,
  AppStateStatus,
  Platform,
  View,
  InteractionManager,
} from 'react-native'
import {
  NavigationInjectedProps, NavigationEventSubscription
} from 'react-navigation'

import { PERMISSIONS, RESULTS, request, openSettings, check, Permission } from 'react-native-permissions'

import { ScannerComponent } from '../component/scanner'
import { NoPermissionComponent } from '../component/noPermission'
import { Colors } from 'src/styles'
import { Wrapper } from 'src/ui/structure'

interface Props extends NavigationInjectedProps {
  consumeToken: (jwt: string) => Promise<any>
}

const CAMERA_PERMISSION = Platform.select({
  android: PERMISSIONS.ANDROID.CAMERA,
  ios: PERMISSIONS.IOS.CAMERA
}) as Permission

export const ScannerContainer: React.FC<Props> = (props) => {
  const { consumeToken, navigation } = props
  const [reRenderKey, setRenderKey] = useState(Date.now())
  const [permission, setPermission] = useState<string>(RESULTS.UNAVAILABLE)
  const [scannerRef, setScannerRef] = useState<QRScanner|null>(null)
  const reactivate = () => scannerRef && scannerRef.reactivate()

  // NOTE: this is needed because QRScanner behaves weirdly when the screen is
  // remounted.... but we don't have error state here because rebase
  // FIXME TODO @mnzaki
  //if (!isError) reactivate()

  const rerender = () => {
    setRenderKey(Date.now())
    reactivate()
  }

  useEffect(() => {
    let listener: NavigationEventSubscription | undefined
    if (navigation) {
      listener = navigation.addListener('didFocus', () => {
        rerender()
        checkCameraPermissions()
      })
    }
    checkCameraPermissions()

    return () => listener && listener.remove()
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

  let ret
  if (permission === RESULTS.GRANTED) {
    ret = (
      <ScannerComponent
        reRenderKey={reRenderKey}
        onScan={consumeToken}
        onScannerRef={r => setScannerRef(r)}
      />
    )
  } else if (permission === RESULTS.UNAVAILABLE) {
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

  return <Wrapper dark withoutSafeArea withoutStatusBar>{ret}</Wrapper>
}

export const Scanner = ScannerContainer
