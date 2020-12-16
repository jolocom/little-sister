import React from 'react'
import { LandingContainer } from 'src/ui/landing/containers/landing'
import { shallow } from 'enzyme'
import { createMockNavigationScreenProp } from 'tests/utils'

describe('landing container', () => {
  it('mounts correctly and matches snapshot', () => {
    const props = {
      getStarted: jest.fn(),
      recoverIdentity: jest.fn(),
      navigation: createMockNavigationScreenProp({}),
    }
    const rendered = shallow(<LandingContainer {...props} />)
    expect(rendered).toMatchSnapshot()
    expect(props.getStarted).not.toHaveBeenCalled()
  })
})
