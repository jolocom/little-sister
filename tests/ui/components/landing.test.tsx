import React from 'react'
import { LandingComponent } from 'src/ui/landing/components/landing'
import { shallow } from 'enzyme'

describe('landing component', () => {
  const defaultProps = {
    isOffline: false,
    handleGetStarted: jest.fn(),
    handleRecover: jest.fn(),
  }

  it('matches the snapshot on render', () => {
    const rendered = shallow(<LandingComponent {...defaultProps} />)
    expect(rendered).toMatchSnapshot()
  })

  it('renders with disabled buttons when there is no connection', () => {
    const props = {
      ...defaultProps,
      isOffline: true,
    }
    const rendered = shallow(<LandingComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
