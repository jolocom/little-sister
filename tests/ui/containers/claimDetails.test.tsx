import { clone } from 'ramda'
import * as React from 'react'
import { shallow } from 'enzyme'
import { ClaimDetailsContainer } from 'src/ui/home/containers/claimDetails'
import { initialState as claimsInitialState } from 'src/reducers/account/claims'

describe('ClaimDetails container', () => {
  const COMMON_PROPS = {
    claims: Object.assign(clone(claimsInitialState), {
      selected: {
        credentialType: 'Email',
        claimData: {
          email: 'test@test.com',
        },
      },
    }),
    handleClaimInput: jest.fn(),
    saveClaim: jest.fn(),
    onBackPress: jest.fn(),
  }

  it('mounts correctly and matches the snapshot', () => {
    const rendered = shallow(<ClaimDetailsContainer {...COMMON_PROPS} />)
    expect(rendered).toMatchSnapshot()
  })

  // TODO
  // write test to make sure generated field inputs stay the same order after
  // getting some input
})
