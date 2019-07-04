import {genericActions} from 'src/actions'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {AppError} from '../../../src/lib/errors'
import ErrorCode from '../../../src/lib/errorCodes'

describe.only('Generic action creators', () => {
  describe('showErrorScreen', () => {
    it('should navigate to error screen and provide the message', () => {
      const mockStore = configureStore([thunk])({})
      const mockError = new AppError(ErrorCode.Unknown,  new Error('Test Error'))

      const action = genericActions.showErrorScreen(mockError)

      mockStore.dispatch(action)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })
})
