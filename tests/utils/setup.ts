import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { NativeModules } from 'react-native'

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() })

jest.mock('rn-fetch-blob', () => ({
  __esModule: true,
  default: {
    DocumentDir: () => {},
    polyfill: () => {},
    fetch: jest.fn(),
  },
}))

jest.mock('src/lib/storage/storage', () => ({
  __esModule: true,
  Storage: jest.fn(),
}))

jest.mock('deprecated-react-native-listview')

NativeModules.RNCNetInfo = {
  getCurrentConnectivity: jest.fn(),
  isConnectionMetered: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
}
