import React from 'react'
import { SeedPhrase } from 'src/ui/registration/components/seedPhrase'
import { shallow } from 'enzyme'

describe('seedPhrase component', () => {
  const makeProps = (otherProps: any) => ({
    seedPhrase: 'mock seedPhrase',
    handleButtonTap: jest.fn(),
    onCheck: jest.fn(),
    ...otherProps
  })

  it('matches the snapshot with checkbox unchecked', () => {
    const props = makeProps({ checked: false })
    const rendered = shallow(<SeedPhrase {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('matches the snapshot with checkbox checked', () => {
    const props = makeProps({ checked: true })
    const rendered = shallow(<SeedPhrase {...props} />)
    expect(rendered).toMatchSnapshot()
  })
})
