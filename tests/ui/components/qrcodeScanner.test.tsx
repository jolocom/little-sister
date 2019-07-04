import React from 'react'
import { QRcodeScanner } from 'src/ui/generic/qrcodeScanner'
import { shallow } from 'enzyme'
import mockCamera from '../../__mocks__/react-native-camera'

describe('QRCodeScanner component', () => {
  // TODO Is this needed?
  jest.mock('react-native-camera', () => mockCamera)

  it('matches the snapshot with back handler', () => {
    const props: QRcodeScanner['props'] = {
      onScannerSuccess: jest.fn(),
      onScannerCancel: jest.fn(),
      loading: false
    }

    const rendered = shallow(<QRcodeScanner {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
