import React from 'react'
import { Inputs } from '../../../../src/ui/errors/containers/errorReporting'
import { shallow } from 'enzyme'
import { ChooseIssueSection } from '../../../../src/ui/errors/components/chooseIssueSection'

describe('ChooseIssueSection Component', () => {
  const defaultProps = {
    currentInput: Inputs.None,
    setInput: jest.fn(),
    onIssuePick: jest.fn(),
    pickedIssue: '',
  }

  it('matches the snapshot on initial render', () => {
    const component = shallow(<ChooseIssueSection {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })

  it('renders the dropdown with selected border', () => {
    const props = { ...defaultProps, currentInput: Inputs.Dropdown }
    const component = shallow(<ChooseIssueSection {...props} />)
    expect(component).toMatchSnapshot()
  })
})
