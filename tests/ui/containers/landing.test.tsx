import React from 'react'
import { LandingContainer } from 'src/ui/landing/containers/landing'
import { LoadingScreen } from 'src/ui/generic'
import { shallow } from 'enzyme'

describe('landing container', () => {
  it('mounts correctly and matches snapshot if loading', () => {
    const props = {
      startRegistration: jest.fn(),
      loading: true,
    }

    const rendered = shallow(<LandingContainer {...props} />)
    expect(rendered).toMatchSnapshot()
    expect(props.startRegistration).not.toHaveBeenCalled()

    const childWrapper = rendered.find(LoadingScreen)
    expect(childWrapper).toHaveLength(1)
  })

  it('mounts correctly and matches snapshot if loading is finished', () => {
    const props: LandingContainer['props'] = {
      startRegistration: jest.fn(),
      loading: false,
    }

    const rendered = shallow(<LandingContainer {...props} />)
    expect(rendered).toMatchSnapshot()
    expect(props.startRegistration).not.toHaveBeenCalled()
  })
})
