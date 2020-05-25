import { navigationActions } from '../../../src/actions'
import { JolocomLib } from 'jolocom-lib'
import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { interactionHandlers } from 'src/lib/storage/interactionTokens'
import { createMockStore } from 'tests/utils'
import { AppError } from 'src/lib/errors'

describe('Navigation action creators', () => {
  describe('handleDeepLink', () => {
    const jwt = 'mockJWT'

    const mockDid = 'did:jolo:mock'

    const mockStore = createMockStore(
      {
        account: {
          did: {
            did: mockDid,
          },
        },
        generic: {
          appWrapConfig: {},
        },
      },
      {
        storageLib: {
          get: {
            persona: jest.fn().mockResolvedValue([{ did: mockDid }]),
            encryptedSeed: jest.fn().mockResolvedValue('johnnycryptoseed'),
          },
        },
        keyChainLib: {
          getPassword: jest.fn().mockResolvedValue('secret123'),
        },
        identityWallet: {
          validateJWT: jest.fn().mockResolvedValue(true),
        },
      },
    )

    const parseInteractionTokenSpy = jest.spyOn(
      JolocomLib.parse.interactionToken,
      'fromJWT',
    )

    const interactionHandlersSpies = {}
    Object.keys(interactionHandlers).forEach(typ => {
      interactionHandlersSpies[typ] = jest
        // @ts-ignore bleh
        .spyOn(interactionHandlers, typ)
        .mockReturnValue({ type: `MOCK_${typ}_INTERACTION_TOKEN_HANDLER` })
    })

    beforeEach(() => {
      jest.useFakeTimers()
      mockStore.reset()
      parseInteractionTokenSpy.mockClear()
    })

    // TODO: refactor test case to account for identity check when deeplinking
    it('should extract the route name and param from the URL', async () => {
      parseInteractionTokenSpy.mockImplementation(jwt => {
        const token = new JSONWebToken()
        token.payload = { typ: InteractionType.CredentialRequest }
        return token
      })

      const action = navigationActions.handleDeepLink(
        'jolocomwallet://consent/' + jwt,
      )

      await mockStore.dispatch(action)
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseInteractionTokenSpy).toHaveBeenCalledWith(jwt)
    })

    it('should throw AppError if route was not correct', () => {
      const action = navigationActions.handleDeepLink(
        'jolocomwallet://somethingElse/' + jwt,
      )

      expect(() => mockStore.dispatch(action)).toThrow(AppError)
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(parseInteractionTokenSpy).not.toHaveBeenCalled()
    })
  })
})
