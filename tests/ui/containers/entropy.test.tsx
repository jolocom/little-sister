import React from 'react'
import { shallow } from 'enzyme'
import { EntropyContainer } from 'src/ui/registration/containers/entropy'
import * as util from 'src/lib/util'

describe('Entropy container', () => {
  const props = {}

  it('mounts correctly and matches the snapshot', () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('correctly creates an entropy generator upon component mount', () => {
    const entropySpy = jest.spyOn(
      EntropyContainer.prototype,
      'setUpEntropyGenerator',
    )
    const rendered = shallow(<EntropyContainer {...props} />)
    expect(entropySpy).toHaveBeenCalledTimes(1)
  })

  it('correctly handles added points with the entropy generator', () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance()

    expect(rendered.state()).toMatchSnapshot()

    instance.updateEntropyProgress = jest.fn()
    instance.entropyGenerator.getProgress = jest.fn().mockReturnValue(1)
    instance.entropyGenerator.addFromDelta = jest.fn()

    instance.addPoint(150, 220)

    expect(instance.entropyGenerator.getProgress).toHaveBeenCalledTimes(1)
    expect(instance.updateEntropyProgress).toHaveBeenCalledTimes(1)
    expect(instance.entropyGenerator.addFromDelta).toHaveBeenCalledTimes(2)
    expect(instance.entropyGenerator.addFromDelta.mock.calls).toEqual([
      [150],
      [220],
    ])

    expect(rendered.state()).toMatchSnapshot()
  })

  it('correctly triggers a random string generation when there is sufficient entropy', async () => {
    // @ts-ignore hacky mock
    util.generateSecureRandomBytes = () => Buffer.from('moreEntropy')

    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance()
    expect(rendered.state()).toMatchSnapshot()

    const mockGenerateRandomString = jest.fn().mockReturnValue('randomString')
    instance.entropyGenerator.generateRandomString = mockGenerateRandomString

    rendered.setState({ entropyProgress: 1 })
    await instance.updateEntropyProgress()

    expect(rendered.state()).toMatchSnapshot()
  })

  it('does not trigger a random string generation when there is not sufficient entropy', async () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance()

    expect(rendered.state()).toMatchSnapshot()

    const mockGenerateRandomString = jest.fn().mockReturnValue('randomString')
    instance.entropyGenerator.generateRandomString = mockGenerateRandomString
    rendered.setState({ entropyProgress: 0.99 })
    await instance.updateEntropyProgress()

    expect(rendered.state()).toMatchSnapshot()
  })
})
