import React from 'react'
import { Wrapper } from 'src/ui/structure/'

const ShallowRenderer = require('react-test-renderer/shallow')

describe('generic container component', () => {
  it('matches the snapshot with no extra props', () => {
    const renderer = new ShallowRenderer()
    const rendered = renderer.render(<Wrapper> null </Wrapper>)
    expect(rendered).toMatchSnapshot()
  })
})
