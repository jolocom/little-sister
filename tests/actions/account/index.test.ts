import { accountActions } from 'src/actions/'
import data from '../registration/data/mockRegistrationData'
import { JolocomLib } from 'jolocom-lib'
import { RootState } from 'src/reducers'
import { createMockStore } from 'tests/utils'
import { DidDocument } from 'jolocom-lib/js/identity/didDocument/didDocument'

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
    registry: {
      contractsAdapter: jest.fn(),
      contractsGateway: jest.fn(),
      authenticate: jest.fn().mockResolvedValue(mockIdentityWallet),
    },
    storageLib: {
      get: {
        persona: jest.fn().mockResolvedValue({
          did: 'did:jolo:first',
        }),
        encryptedSeed: jest.fn().mockResolvedValue('mockencryptedvalue'),
        didDoc: jest.fn().mockResolvedValue(undefined),
      },
      store: {
        didDoc: jest.fn().mockResolvedValue(undefined),
      },
    },
    keyChainLib: {
      getPassword: jest.fn().mockResolvedValue('secret'),
    },
    encryptionLib: {
      decryptWithPass: jest.fn().mockReturnValue('a'.repeat(64)),
    },
    identityWallet: mockIdentityWallet,
  }

  //@ts-ignore
  const mockStore = createMockStore(initialState, mockMiddleware)

  beforeEach(mockStore.reset)

  it('Should correctly handle existing user identity if not cached', async () => {
    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockMiddleware.registry.authenticate).toHaveBeenCalledTimes(1)
    expect(mockMiddleware.storageLib.store.didDoc).toHaveBeenCalledWith(
      mockMiddleware.identityWallet.identity.didDocument,
    )

    expect(mockStore.getActions()).toMatchSnapshot()
    mockMiddleware.registry.authenticate.mockReset()
  })

  it('Should correctly handle existing user identity if cached', async () => {
    const mockDidDoc = DidDocument.fromJSON({
      id: 'did:jolo:first',
      publicKey: [
        //@ts-ignore
        {
          publicKeyHex: '0xabc',
          id: 'did:jolo:first#123',
        },
      ],
    })

    mockStore.backendMiddleware.storageLib.get.didDoc = jest
      .fn()
      .mockResolvedValue(mockDidDoc)

    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockMiddleware.registry.authenticate).not.toHaveBeenCalled()
    expect(mockMiddleware.identityWallet.identity.didDocument).toStrictEqual(
      mockDidDoc,
    )
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('Should correctly handle more existing user identities', async () => {
    mockMiddleware.storageLib.get.persona.mockResolvedValueOnce([
      { did: 'did:jolo:first' },
    ])
    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('Should correctly handle an empty encrypted seed table', async () => {
    mockMiddleware.storageLib.get.persona.mockResolvedValueOnce([])
    mockMiddleware.storageLib.get.encryptedSeed.mockReturnValueOnce(null)
    await mockStore.dispatch(accountActions.checkIdentityExists)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('Should correctly retrieve claims from device storage db on setClaimForDid', async () => {
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
