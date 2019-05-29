import { genericActions } from 'src/actions'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('Generic action creators', () => {
  describe('showErrorScreen', () => {
    it('should navigate to error screen and provide the message', () => {
      const mockStore = configureStore([thunk])({})
      const mockError = {
        message: 'MOCK BAD ERROR',
        stack: 'MOCK STACK TRACE',
      }

      const action = genericActions.showErrorScreen(mockError)

      mockStore.dispatch(action)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })
})
