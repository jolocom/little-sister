import { expect } from 'detox'
import jestExpect from 'expect'
import { readVisibleText } from 'e2e/utils'

describe('Identity Creation', () => {
  describe('Entropy Screen', () => {
    const progressRegexp = /(\d+) %/

    beforeAll(async () => {
      // we must disable automatic synchronization because of the inifinite loop
      // animation on the entropy screen
      await device.disableSynchronization()
      const getStarted = element(by.id('getStarted'))
      await getStarted.tap()
      // and manually synchronize by waiting for entropyMessage to be visible
      // NOTE: waitFor polls
      await waitFor(element(by.id('entropyMsg')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('should show an entropyMsg help text at first', async () => {
      const entropyMsg = element(by.id('entropyMsg'))
      await expect(entropyMsg).toBeVisible()
      const text = await readVisibleText('entropyMsg')
      jestExpect(text).not.toMatch(progressRegexp)
    })

    it('should show a percentage of entropy collected on swipe in scratchArea', async () => {
      const scratchArea = element(by.id('scratchArea'))
      await scratchArea.swipe('right', 'slow')

      // at this point the animation is hidden
      await device.enableSynchronization()

      const text = await readVisibleText('entropyMsg')
      jestExpect(text).toMatch(progressRegexp)

      const swipeDirs: Detox.Direction[] = ['up', 'down', 'left', 'right']
      for (let progress = 0; progress < 100; ) {
        let text
        try {
          text = await readVisibleText('entropyMsg')
        } catch (err) {
          // if we made enough progress then screen will have changed and
          // entropyMsg will not be visible
          if (progress > 90) break
          else throw err
        }
        const match = progressRegexp.exec(text)
        jestExpect(match).toHaveLength(2)
        progress = parseInt((match as string[])[1])
        await scratchArea.swipe(swipeDirs[progress % 4], 'fast')
      }
    })

    it('should navigate home after successful creation', async () => {
      await waitFor(element(by.id('claimsScreen')))
        .toBeVisible()
        .withTimeout(30000)
    })
  })
})
