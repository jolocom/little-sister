import React from 'react'
import { shallow } from 'enzyme'
import { ClaimsContainer } from 'src/ui/home/containers/claims'

describe('Claims container', () => {
  const COMMON_PROPS = {
    showClaimsDetails: false,
    typeClaimDetails: '',
    claimsState: {
      decoratedCredentials: {},
    },
    toggleLoading: () => {},
  }

  it('mounts correctly and matches the snapshot', () => {
    const setClaimsForDid = jest.fn()

    const props = Object.assign({}, COMMON_PROPS, {
      setClaimsForDid,
    })

    const rendered = shallow(<ClaimsContainer {...props} />)

    expect(rendered).toMatchSnapshot()
    expect(setClaimsForDid).toHaveBeenCalledTimes(1)
  })

  it('correctly changes scanning to true when qr code scanner is started', () => {
    const props = Object.assign({}, COMMON_PROPS, {
      setClaimsForDid: () => {},
    })

    const rendered = shallow(<ClaimsContainer {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('correctly changes scanning to false when qr code scanner is canceled', () => {
    const onScannerCancel = jest.fn()

    const props = Object.assign({}, COMMON_PROPS, {
      setClaimsForDid: () => {},
    })

    const rendered = shallow(<ClaimsContainer {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
