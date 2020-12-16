import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() })

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  RN.NativeModules.RNPermissions = {}
  RN.NativeModules.RNCAsyncStorage = {}
  RN.NativeModules.Vibration = { vibrate: () => true }
  return RN
})
