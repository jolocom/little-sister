import { expect } from 'detox'
import { readVisibleText } from 'e2e/utils'
import jestExpect from 'expect'

describe('Identity Recovery', () => {
  beforeAll(async () => {
    const recoverIdentity = element(by.id('recoverIdentity'))
    await recoverIdentity.tap()
  })

  describe('Input Seed Phrase Screen', () => {
    it('should show a recoveryMsg', async () => {
      const recoveryMsg = element(by.id('recoveryMsg'))
      await expect(recoveryMsg).toBeVisible()
    })

    it('should show a seedWordFld', async () => {
      const seedWordFld = element(by.id('seedWordFld'))
      await expect(seedWordFld).toBeVisible()
      await seedWordFld.tap()
    })

    const seedPhraseWords = [
      'school',
      'leopard',
      'pretty',
      'shell',
      'soup',
      'paddle',
      'spot',
      'absurd',
      'blame',
      'morning',
      'perfect',
      'local',
    ]

    it('should show word suggestions based on input prefix', async () => {
      const seedWordFld = element(by.id('seedWordFld'))

      for (let w = 0; w < 4; w++) {
        const word = seedPhraseWords[w]

        // type a part of the word and expect suggestions
        const wordPrefix = word.slice(0, word.length / 2)
        await seedWordFld.replaceText(wordPrefix)
        for (let e = 0; e < 10; e++) {
          let suggestion
          try {
            suggestion = await readVisibleText(`seedSuggestion${e}`)
          } catch (err) {
            // we don't know how many suggestions there are, so just break
            // TODO figure out how to count with detox
            break
          }
          jestExpect(suggestion.slice(0, wordPrefix.length)).toMatch(wordPrefix)
        }
      }
    })

    it('should add words to seed phrase on tap', async () => {
      const seedWordFld = element(by.id('seedWordFld'))
      const seedPhraseMsg = element(by.id('seedPhraseMsg'))
      await expect(seedPhraseMsg).toBeVisible()

      for (let w = 0; w < seedPhraseWords.length; w++) {
        const word = seedPhraseWords[w]
        // type the full word and expect to have it as the first suggestion
        // TODO test that it is the only suggestion
        await seedWordFld.replaceText(word)
        const suggestionBtn = element(
          by.id('seedSuggestion0').withDescendant(by.text(word)),
        )
        await expect(suggestionBtn).toBeVisible()
        await suggestionBtn.tap()

        // expect the seedPhrase displayed to be updated
        const curSeedPhrase = await readVisibleText('seedPhraseMsg')
        const expectedSeedPhrase = seedPhraseWords.slice(0, w + 1).join('')
        jestExpect(curSeedPhrase).toEqual(expectedSeedPhrase)
      }
    })

    it('should show a restoreAccount button', async () => {
      const restoreAccount = element(by.id('restoreAccount'))
      await expect(restoreAccount).toBeVisible()
      await restoreAccount.tap()
    })

    it('should navigate home after a successful restore', async () => {
      await waitFor(element(by.id('claimsScreen')))
        .toBeVisible()
        .withTimeout(10000)
    })
  })
})
