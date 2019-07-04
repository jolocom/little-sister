import { navigationActions } from '../../../src/actions'
import { JolocomLib } from 'jolocom-lib'

import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {BackendMiddleware} from '../../../src/backendMiddleware'

describe('Navigation action creators', () => {
  describe('handleDeepLink', () => {
    const jwt =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7'

    // TODO: refactor test case to account for identity check when deeplinking
    it('should extract the route name and param from the URL', async () => {
      const mockStore = configureStore([thunk])({})
      const mockBackendMiddleware: BackendMiddleware = {
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
        identityWallet: jest.fn(),
      }
      const parseInteractionTokenSpy = jest
        .spyOn(JolocomLib.parse.interactionToken, 'fromJWT')
        .mockImplementation(jest.fn())
      const action = navigationActions.handleDeepLink(
        'smartwallet://consent/' + jwt,
      )
      await action(mockStore.dispatch, jest.fn(), mockBackendMiddleware)
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseInteractionTokenSpy).toHaveBeenCalledWith(jwt)
      parseInteractionTokenSpy.mockReset()
    })

    it('should not atttempt to parse if route was not correct', () => {
      const mockStore = configureStore([thunk])({})
      const parseInteractionTokenSpy = jest.spyOn(
        JolocomLib.parse.interactionToken,
        'fromJWT',
      )
      const action = navigationActions.handleDeepLink(
        'smartwallet://somethingElse/' + jwt,
      )

      action(mockStore.dispatch)
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseInteractionTokenSpy).not.toHaveBeenCalled()
    })
  })
})
