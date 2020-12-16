import React from 'react'
import { shallow } from 'enzyme'
import { ToggleSwitch } from '../../../src/ui/structure/toggleSwitch'
import { TouchableOpacity } from 'react-native'

describe('ToggleSwitch Component', () => {
  const defaultProps = {
    value: false,
    onToggle: jest.fn(),
  }

  it('matches the snapshot on initial render', () => {
    const component = shallow(<ToggleSwitch {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the switched on toggle', () => {
    const props = { ...defaultProps, value: true }
    const component = shallow(<ToggleSwitch {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the toggle with custom gradients', () => {
    jest.useFakeTimers()
    const props = {
      ...defaultProps,
      onGradient: ['rgb(13, 24, 156)', 'rgb(55, 34, 222)'],
      offGradient: ['rgb(53, 39, 126)', 'rgb(65, 24, 24)'],
    }
    const component = shallow(<ToggleSwitch {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the toggle with custom track color', () => {
    jest.useFakeTimers()
    const props = { ...defaultProps, trackColor: 'rgb(0, 0, 0)' }
    const component = shallow(<ToggleSwitch {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('calls onToggle when pressed', () => {
    const component = shallow(<ToggleSwitch {...defaultProps} />)
    component.find(TouchableOpacity).simulate('press')
    expect(defaultProps.onToggle).toBeCalledTimes(1)
  })
})
