import React from 'react'
import { Inputs } from '../../../../src/ui/errors/containers/errorReporting'
import { shallow } from 'enzyme'
import { TextInput } from 'react-native'
import { ContactSection } from '../../../../src/ui/errors/components/contactSection'

describe('ContactSection Component', () => {
  const defaultProps = {
    currentInput: Inputs.None,
    setInput: jest.fn(),
    onContactInput: jest.fn(),
    contactValue: '',
  }

  it('matches the snapshot on initial render', () => {
    const component = shallow(<ContactSection {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the input with selected border', () => {
    const props = { ...defaultProps, currentInput: Inputs.Description }
    const component = shallow(<ContactSection {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('correctly calls setInput on input focus', () => {
    const component = shallow(<ContactSection {...defaultProps} />)
    component.find(TextInput).simulate('focus')
    expect(defaultProps.setInput).toBeCalledTimes(1)
  })

  it('correctly calls setInput on input blur', () => {
    const component = shallow(<ContactSection {...defaultProps} />)
    component.find(TextInput).simulate('blur')
    expect(defaultProps.setInput).toBeCalledTimes(2)
  })
})
