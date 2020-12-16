import React from 'react'
import { shallow } from 'enzyme'
import { ScannerComponent } from '../../../src/ui/interaction/component/scanner'
import { TouchableHighlight } from 'react-native'
import { stub } from '../../utils'
import QRCodeScanner, { Event } from 'react-native-qrcode-scanner'


describe('Scanner component', () => {
  const defaultProps = {
    onScan: jest.fn().mockReturnValueOnce(Promise.resolve()),
    shouldScan: true,
    reRenderKey: 4,
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('matches the snapshot on initial render', () => {
    const component = shallow(<ScannerComponent {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('matches snapshot when the torch button is pressed', () => {
    const component = shallow(<ScannerComponent {...defaultProps} />)
    component.find(TouchableHighlight).simulate('pressIn')
    expect(component).toMatchSnapshot()
  })

  it('should correctly render the QRScanner and call onRead', () => {
    jest.useFakeTimers()
    const mockEvent = stub<Event>({ data: 'test-jwt' })
    const component = shallow(<ScannerComponent {...defaultProps} />)

    component
      .find(QRCodeScanner)
      .props()
      .onRead(mockEvent)

    expect(defaultProps.onScan).toHaveBeenCalledWith('test-jwt')
  })
})
