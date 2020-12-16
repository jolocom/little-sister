import * as Keychain from 'react-native-keychain'

const useResetKeychainValues = (service: string) => {
  const resetServiceValuesInKeychain = async () => {
    try {
      await Keychain.resetGenericPassword({
        service,
      })
    } catch (err) {
      console.log({ err })
    }
  }
  return resetServiceValuesInKeychain
}

export default useResetKeychainValues
