import { expect } from 'detox'

describe('Landing', () => {
  describe('Landing Screen', () => {
    it('should show a landingCarousel', async () => {
      const landingCarousel = element(by.id('landingCarousel'))
      await expect(landingCarousel).toBeVisible()
    })

    it('should show a getStarted button', async () => {
      const getStarted = element(by.id('getStarted'))
      await expect(getStarted).toBeVisible()
    })

    it('should show a recoverIdentity button', async () => {
      const recoverIdentity = element(by.id('recoverIdentity'))
      await expect(recoverIdentity).toBeVisible()
    })
  })
})
