import { navigationActions, ssoActions } from '../../../src/actions'

import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

describe('Navigation action creators', () => {
  describe('handleDeepLink', () => {
    const jwt =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7'

    // TODO: refactor test case to account for identity check when deeplinking
    it('should extract the route name and param from the URL', async () => {
      const mockStore = configureStore([thunk])({})
      const mockBackendMiddleware = {
        storageLib: {
          get: {
            persona: jest.fn().mockResolvedValue([{ did: 'did:jolo:mock' }]),
            encryptedSeed: jest.fn().mockResolvedValue('johnnycryptoseed'),
          },
        },
        keyChainLib: {
          getPassword: jest.fn().mockResolvedValue('secret123'),
        },
        encryptionLib: {
          decryptWithPass: () => 'angelaMerkleTreeSeed',
        },
        setIdentityWallet: jest.fn(() => Promise.resolve()),
      }
      const parseJWTSpy = jest
        .spyOn(ssoActions, 'parseJWT')
        .mockImplementation(() => () => {})
      const action = navigationActions.handleDeepLink(
        'smartwallet://consent/' + jwt,
      )
      await action(mockStore.dispatch, () => {}, mockBackendMiddleware)
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseJWTSpy).toHaveBeenCalledWith(jwt)
      parseJWTSpy.mockReset()
    })

    it('should not atttempt to parse if route was not correct', () => {
      const mockStore = configureStore([thunk])({})
      const parseJWTSpy = jest.spyOn(ssoActions, 'parseJWT')
      const action = navigationActions.handleDeepLink(
        'smartwallet://somethingElse/' + jwt,
      )

      action(mockStore.dispatch)
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseJWTSpy).not.toHaveBeenCalled()
    })
  })
})
