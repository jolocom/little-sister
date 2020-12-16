import { useState, useEffect, useRef } from 'react'
import * as Keychain from 'react-native-keychain'
import AsyncStorage from '@react-native-community/async-storage'

import { PIN_SERVICE } from '../utils/keychainConsts'
import { BiometryTypes } from '../types'

const useGetStoredAuthValues = () => {
  const [isLoadingStorage, setIsLoadingStorage] = useState(false)
  const [biometryType, setBiometryType] = useState<BiometryTypes>(null)
  const [keychainPin, setKeychainPin] = useState('')

  const isBiometrySelected = useRef(false)

  useEffect(() => {
    let isCurrent = true

    const getStoredPin = async () => {
      setIsLoadingStorage(true)
      try {
        const [storedBiometry, storedPin] = await Promise.all([
          AsyncStorage.getItem('biometry'),
          Keychain.getGenericPassword({
            service: PIN_SERVICE,
          }),
        ])

        isCurrent && setBiometryType(storedBiometry as BiometryTypes)
        if (storedPin) {
          isCurrent && setKeychainPin(storedPin.password)
        } else {
          throw new Error('No PIN was set, revisit your flow of setting up PIN')
        }
        if (storedBiometry && isCurrent) {
          // show biometry view
          isBiometrySelected.current = true
        } else {
          // show pin view
          if (isCurrent) {
            isBiometrySelected.current = false
          }
        }
      } catch (err) {
        // ✍🏼 todo: how should we handle this hasError ?
        console.log({ err })
      } finally {
        isCurrent && setIsLoadingStorage(false)
      }
    }
    getStoredPin()
    return () => {
      isCurrent = false
    }
  }, [])

  return {
    isLoadingStorage,
    biometryType,
    keychainPin,
    isBiometrySelected,
  }
}

export default useGetStoredAuthValues
