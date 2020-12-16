import React from 'react'
import { Inputs } from '../../../../src/ui/errors/containers/errorReporting'
import { shallow } from 'enzyme'
import { DescriptionSection } from '../../../../src/ui/errors/components/descriptionSection'
import { TextInput } from 'react-native'

describe('DescriptionSection Component', () => {
  const defaultProps = {
    currentInput: Inputs.None,
    setInput: jest.fn(),
    setDescription: jest.fn(),
    toggleState: false,
    setToggle: jest.fn(),
    description: 'Test',
  }
  it('matches the snapshot on initial render', () => {
    const component = shallow(<DescriptionSection {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the input with selected border', () => {
    const props = { ...defaultProps, currentInput: Inputs.Description }
    const component = shallow(<DescriptionSection {...props} />)
    expect(component).toMatchSnapshot()
  })

  it('correctly calls setInput on input focus', () => {
    const component = shallow(<DescriptionSection {...defaultProps} />)
    component.find(TextInput).simulate('focus')
    expect(defaultProps.setInput).toBeCalledTimes(1)
  })

  it('correctly calls setInput on input blur', () => {
    const component = shallow(<DescriptionSection {...defaultProps} />)
    component.find(TextInput).simulate('blur')
    expect(defaultProps.setInput).toBeCalledTimes(2)
  })
})
