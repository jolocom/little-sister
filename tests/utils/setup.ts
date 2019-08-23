import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

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
