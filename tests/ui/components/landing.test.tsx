import React from 'react'
import { LandingComponent } from 'src/ui/landing/components/landing'
import { shallow } from 'enzyme'

describe('landing component', () => {
  it('matches the snapshot on render', () => {
    const props = {
      handleButtonTap: jest.fn()
    }

    const rendered = shallow(<LandingComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
