import React from 'react'
import { shallow } from 'enzyme'
import {
  ClaimsContainer,
  ClaimsContainerProps,
} from 'src/ui/home/containers/claims'
import { initialState } from '../../../src/reducers/account/claims'
import { createMockNavigationScreenProp } from 'tests/utils'

describe('Claims container', () => {
  const COMMON_PROPS: ClaimsContainerProps = {
    claimsState: initialState,
    openClaimDetails: jest.fn(),
    checkLocalAuthSet: jest.fn(),
    did: '',
    navigation: createMockNavigationScreenProp({}),
  }

  it('mounts correctly and matches the snapshot', () => {
    const rendered = shallow(<ClaimsContainer {...COMMON_PROPS} />)
    expect(rendered).toMatchSnapshot()
  })
})
