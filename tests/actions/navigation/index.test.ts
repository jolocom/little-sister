import { navigationActions, interactionHandlers } from '../../../src/actions'
import { JolocomLib } from 'jolocom-lib'
import { createMockStore } from 'tests/utils'
import { AppError } from 'src/lib/errors'
import { FlowType } from '@jolocom/sdk'

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
        passwordStore: {
          getPassword: jest.fn().mockResolvedValue('secret123'),
        },
        identityWallet: {
          validateJWT: jest.fn().mockResolvedValue(true),
        },
        processJWT: jest.fn(),
        findInteraction: jest.fn().mockResolvedValue(undefined)
      },
    )

    const parseInteractionTokenSpy = jest.spyOn(
      JolocomLib.parse.interactionToken,
      'fromJWT',
    )

    beforeEach(() => {
      const interactionHandlersSpies = {}
      Object.keys(interactionHandlers).forEach(typ => {
        interactionHandlersSpies[typ] = jest
          // @ts-ignore bleh
          .spyOn(interactionHandlers, typ)
          // @ts-ignore bleh
          .mockReturnValue({ type: `MOCK_${typ}_INTERACTION_TOKEN_HANDLER` })
      })

      jest.useFakeTimers()
      mockStore.reset()
      parseInteractionTokenSpy.mockClear()
    })

    // TODO: refactor test case to account for identity check when deeplinking
    it('should extract the route name and param from the URL', async () => {
      const action = navigationActions.handleDeepLink(
        'jolocomwallet://consent/' + jwt,
      )

      const processJWT = mockStore.backendMiddleware.processJWT as jest.Mock
      processJWT.mockImplementation(() => {
        return {
          flow: {
            type: FlowType.CredentialShare
          }
        }
      })
      await mockStore.dispatch(action)
      jest.runAllTimers()
      expect(mockStore.getActions()).toMatchSnapshot()
      expect(processJWT).toHaveBeenCalledWith(jwt)
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
