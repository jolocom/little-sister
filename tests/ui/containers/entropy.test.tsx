import React from 'react'
import { shallow } from 'enzyme'
import { EntropyContainer } from 'src/ui/registration/containers/entropy'
import { EntropyGenerator } from 'src/lib/entropyGenerator'
import * as util from '@jolocom/sdk/js/util'
import { stub, reveal } from 'tests/utils'

describe('Entropy container', () => {
  const mockInstanceGenerator = (
    instance: EntropyContainer,
    progressValues = [0],
  ) => {
    const getProgress = jest.fn().mockReturnValue(progressValues[0])
    // @ts-ignore private
    const generatorMock = (instance.entropyGenerator = stub<EntropyGenerator>({
      getProgress,
      addFromDelta: jest.fn(),
      generateRandomString: jest.fn().mockReturnValue('randomString'),
    }))

    progressValues.forEach(v => getProgress.mockReturnValueOnce(v))

    return generatorMock
  }

  const props = {
    submit: jest.fn(),
  }

  it('mounts correctly and matches the snapshot', () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    expect(rendered).toMatchSnapshot()
  })

  it('correctly creates an entropy generator upon component mount', () => {
    const entropySpy = jest.spyOn(
      EntropyContainer.prototype,
      // @ts-ignore private
      'setUpEntropyGenerator',
    )
    shallow(<EntropyContainer {...props} />)
    expect(entropySpy).toHaveBeenCalledTimes(1)
  })

  it('correctly handles added points with the entropy generator', () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance() as EntropyContainer
    const generatorMock = mockInstanceGenerator(instance)

    expect(rendered.state()).toMatchSnapshot()

    // @ts-ignore private
    instance.updateEntropyProgress = jest.fn()
    // @ts-ignore private
    instance.addPoint(150, 220)
    // @ts-ignore private
    expect(instance.updateEntropyProgress).toHaveBeenCalledTimes(1)

    expect(generatorMock.getProgress).toHaveBeenCalledTimes(1)
    expect(generatorMock.addFromDelta).toHaveBeenCalledTimes(2)
    expect(reveal(generatorMock).addFromDelta.mock.calls).toEqual([
      [150],
      [220],
    ])

    expect(rendered.state()).toMatchSnapshot()
  })

  it('correctly triggers a random string generation when there is sufficient entropy', async () => {
    const generateSecureRandomBytesMock = jest
      .spyOn(util, 'generateSecureRandomBytes')
      .mockResolvedValue(Promise.resolve(Buffer.from('moreEntropy')))

    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance() as EntropyContainer
    mockInstanceGenerator(instance, [0.9, 1])

    expect(rendered.state()).toMatchSnapshot()

    rendered.setState({ entropyProgress: 1 })
    // @ts-ignore private
    await instance.updateEntropyProgress()

    expect(generateSecureRandomBytesMock).toHaveBeenCalled()
    expect(rendered.state()).toMatchSnapshot()
  })

  it('does not trigger a random string generation when there is not sufficient entropy', async () => {
    const rendered = shallow(<EntropyContainer {...props} />)
    const instance = rendered.instance() as EntropyContainer
    mockInstanceGenerator(instance)

    expect(rendered.state()).toMatchSnapshot()

    rendered.setState({ entropyProgress: 0.99 })
    // @ts-ignore private
    await instance.updateEntropyProgress()

    expect(rendered.state()).toMatchSnapshot()
  })
})
