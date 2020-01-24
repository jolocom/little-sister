import React from 'react'
import { shallow } from 'enzyme'
import { NavigationSection } from '../../../../src/ui/structure/navigationSection'
import { TouchableOpacity } from 'react-native'

describe('NavigationSection Component', () => {
  const defaultProps = {
    onNavigation: jest.fn(),
    isBackButton: false,
  }

  it('matches the initial snapshot on render', () => {
    const component = shallow(<NavigationSection {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the section with a back button', () => {
    const props = { ...defaultProps, isBackButton: true }
    const component = shallow(<NavigationSection {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('calls onNavigation when close button is pressed', () => {
    const component = shallow(<NavigationSection {...defaultProps} />)
    component.find(TouchableOpacity).simulate('press')
    expect(defaultProps.onNavigation).toBeCalledTimes(1)
  })

  it('renders one button only', () => {
    const component = shallow(<NavigationSection {...defaultProps} />)
    expect(component.find(TouchableOpacity)).toHaveLength(1)
  })

  it('calls onNavigation when back button is pressed', () => {
    const props = { ...defaultProps, isBackButton: true }
    const component = shallow(<NavigationSection {...props} />)
    component.find(TouchableOpacity).simulate('press')
    expect(props.onNavigation).toBeCalledTimes(2)
  })
})
