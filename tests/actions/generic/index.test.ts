import { genericActions } from 'src/actions'
import { AppError, ErrorCode } from 'src/lib/errors'
import { createMockStore } from 'tests/utils'

describe('Generic action creators', () => {
  describe('showErrorScreen', () => {
    it('should navigate to error screen and provide the message', () => {
      const mockStore = createMockStore()
      const mockError = new AppError(ErrorCode.Unknown, new Error('Test Error'))

      const action = genericActions.showErrorScreen(mockError)

      mockStore.dispatch(action)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })
})
