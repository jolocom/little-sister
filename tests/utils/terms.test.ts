import en from 'src/locales/en.json'
import de from 'src/locales/de.json'
import strings from '../../src/locales/strings'

describe('Terms', () => {
  const expected = Object.entries(strings).map(([key, value]) => value).sort()

  it('English terms should be in sync with strings.ts', () => {
    try {
      expect(Object.keys(en).sort()).toEqual(expected)
    } catch (e) {
      console.error('Please run "yarn terms" to synchronise the terms')
      throw e
    }
  })

  it('German terms should be in sync with strings.ts', () => {
    try {
      expect(Object.keys(de).sort()).toEqual(expected)
    } catch (e) {
      console.error('Please run "yarn terms" to synchronise the terms')
      throw e
    }
  })
})
