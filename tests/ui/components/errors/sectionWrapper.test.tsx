import React from 'react'
import { shallow } from 'enzyme'
import { SectionWrapper } from '../../../../src/ui/errors/components/sectionWrapper'

describe('SectionWrapper Component', () => {
  const defaultProps = {
    title: 'Test',
  }

  it('matches the snapshot on initial render', () => {
    const component = shallow(<SectionWrapper {...defaultProps} />)
    expect(component).toMatchSnapshot()
  })
})
