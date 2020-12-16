import React from 'react'
import { shallow } from 'enzyme'
import InputSeedPhraseComponent from '../../../src/ui/recovery/components/inputSeedPhrase'

describe('inputSeedPhrase component', () => {
  const makeProps = (
    input: string = '',
    suggestions: string[] = [],
    isLoading: boolean = false,
  ) => ({
      handleSubmit: jest.fn(),
      handleCancel: jest.fn(),
      isLoading
  })

  it('matches the snapshot at start', () => {
    const props = makeProps()
    const rendered = shallow(<InputSeedPhraseComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  // it('matches the snapshot while inputting', () => {
  //   const props = makeProps('in', ['insert', 'input'])
  //   const rendered = shallow(<InputSeedPhraseComponent {...props} />)
  //   expect(rendered).toMatchSnapshot()
  // })

  it('matches the snapshot when loading', () => {
    const props = makeProps('', [], true)
    const rendered = shallow(<InputSeedPhraseComponent {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
