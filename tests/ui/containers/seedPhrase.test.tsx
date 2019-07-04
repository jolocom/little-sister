import React from 'react'
import { SeedPhraseContainer } from 'src/ui/registration/containers/seedPhrase'
import { shallow } from 'enzyme'

describe('seedPhrase container', () => {
  it('mounts correctly and matches snapshot', () => {

    const finishRegistration = jest.fn()

    const props : SeedPhraseContainer['props'] = {
      finishRegistration,
      navigation: {
        state: {
          params: {
            mnemonic: 'mock seedPhrase',
          },
        },
      },
    }

    const rendered = shallow(<SeedPhraseContainer {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
