import { accountActions } from 'src/actions/'
import data from '../registration/data/mockRegistrationData'
import { JolocomLib } from 'jolocom-lib'
import { RootState } from 'src/reducers'
import { createMockStore } from 'tests/utils'
import { BackendError } from 'src/backendMiddleware'

describe('Account action creators', () => {
  const initialState: Partial<RootState> = {
    registration: {
      loading: {
        loadingMsg: '',
        isRegistering: false,
      },
    },
    account: {
      loading: false,
      claims: {
        selected: {
          credentialType: 'Email',
          claimData: {
            email: 'test@test.com',
          },
          id: '',
          issuer: {
            did: 'did:jolo:test',
          },
          subject: 'did:jolo:test',
        },
        pendingExternal: {
          offer: [],
          offeror: {
            did: '',
          },
        },
        decoratedCredentials: {},
      },
      did: {
        did: '',
      },
    },
  }

  const mockIdentityWallet = {
    identity: { did: 'did:jolo:first', didDocument: {} },
    didDocument: {},
  }

  const mockMiddleware = {
    prepareIdentityWallet: jest.fn().mockResolvedValue(mockIdentityWallet),
  }

  const mockStore = createMockStore(initialState, mockMiddleware)

  beforeEach(mockStore.reset)

  it('should correctly handle stored encrypted seed', async () => {
    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('should correctly handle an empty encrypted seed table', async () => {
    mockMiddleware.prepareIdentityWallet.mockRejectedValue(
      new BackendError(BackendError.codes.NoEntropy),
    )
    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('should correctly retrieve claims from device storage db on setClaimForDid', async () => {
    const { identityWallet, testSignedCredentialDefault } = data

    const backendMiddleware = {
      storageLib: {
        get: {
          verifiableCredential: jest
            .fn()
            .mockResolvedValue([
              JolocomLib.parse.signedCredential(testSignedCredentialDefault),
            ]),
          credentialMetadata: jest.fn().mockResolvedValue({}),
          publicProfile: jest.fn().mockResolvedValue({}),
        },
      },
      identityWallet,
    }

    const altMockStore = createMockStore(initialState, backendMiddleware)

    await altMockStore.dispatch(accountActions.setClaimsForDid)
    expect(altMockStore.getActions()).toMatchSnapshot()
  })

  it('should correctly save claim', async () => {
    const { identityWallet } = data

    const backendMiddleware = {
      keyChainLib: {
        getPassword: jest.fn().mockResolvedValue('sekrit'),
      },
      storageLib: {
        store: {
          verifiableCredential: jest.fn().mockResolvedValue([]),
        },
        get: {
          verifiableCredential: jest.fn().mockResolvedValue([]),
          publicProfile: jest.fn().mockReturnValue({}),
        },
      },
      identityWallet,
    }

    const altMockStore = createMockStore(initialState, backendMiddleware)

    await altMockStore.dispatch(accountActions.saveClaim)
    expect(altMockStore.getActions()).toMatchSnapshot()
  })
})
