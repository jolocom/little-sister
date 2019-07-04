import { EntropyGenerator } from 'src/lib/entropyGenerator'

describe('EntropyGenerator lib', () => {
  let Entropy: EntropyGenerator

  beforeEach(() => {
    Entropy = new EntropyGenerator()
  })

  it('should correctly add deltas to generator', () => {
    const mockAddEntropy = jest.fn()
    // @ts-ignore private
    Entropy.generator.addEntropy = mockAddEntropy
    Entropy.addFromDelta(1)

    expect(mockAddEntropy).toBeCalledWith(1, 1, 'user')
  })

  it('should correctly get progress', () => {
    const mockGetProgress = jest.fn().mockReturnValue(0)
    // @ts-ignore private
    Entropy.generator.getProgress = mockGetProgress

    expect(Entropy.getProgress()).toBe(0)
    expect(mockGetProgress).toHaveBeenCalledTimes(1)
  })

  it('should correctly generate a randomString given a word count', () => {
    const mockRandomWords = jest.fn()
    const expectedEntropy = 'ef11ef7f00eb7b7dc7e2127f4a2a20e5'
    mockRandomWords.mockReturnValue([
      2146374127,
      2105273088,
      2131944135,
      -450876854,
    ])
    // @ts-ignore private
    Entropy.generator.randomWords = mockRandomWords

    expect(Entropy.generateRandomString(4)).toBe(expectedEntropy)
    expect(mockRandomWords).toBeCalledWith(4)
  })
})
