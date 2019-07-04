import { accountActions } from 'src/actions/'
import configureStore from 'redux-mock-store'
import data from '../registration/data/mockRegistrationData'
import thunk from 'redux-thunk'
import { JolocomLib } from 'jolocom-lib'
import {AccountState} from '../../../src/reducers/account'

describe('Account action creators', () => {
  const initialState : {account: AccountState} = {
    account: {
    loading: {
      loading: false
    },
    claims: {
      selected: {
        credentialType: 'Email',
          claimData: {
          email: 'test@test.com',
        },
        id: '',
          issuer: {
          did: 'did:jolo:test'
        },
        subject: 'did:jolo:test',
      },
      pendingExternal: {
        offer: [],
          offeror: {
          did: ''
        }
      },
      decoratedCredentials: {},
    },
    did: {
      did: ''
    }
  }
}
  const mockStore = configureStore([thunk])(initialState)

  beforeEach(() => {
    mockStore.clearActions()
  })

  it('Should correctly handle one existing user identity', async () => {
    const backendMiddleware = {
      storageLib: {
        get: {
          persona: jest.fn().mockResolvedValue([{ did: 'did:jolo:mock' }]),
          encryptedSeed: jest.fn().mockResolvedValue('johnnycryptoseed'),
        },
      },
      keyChainLib: {
        getPassword: jest.fn().mockResolvedValue('sekrit'),
      },
      encryptionLib: {
        decryptWithPass: () => 'newSeed',
      },
      setIdentityWallet: jest.fn(() => Promise.resolve()),
      identityWallet: { identity: { did: 'did:jolo:mock' } },
    }

    // @ts-ignore
    await accountActions.checkIdentityExists(mockStore.dispatch, jest.fn().mockReturnValue(initialState), backendMiddleware)
    expect(backendMiddleware.setIdentityWallet).toHaveBeenCalledTimes(1)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('Should correctly handle more existing user identities', async () => {
    const backendMiddleware = {
      storageLib: {
        get: {
          persona: jest
            .fn()
            .mockResolvedValue([
              { did: 'did:jolo:first' },
              { did: 'did:jolo:second' },
            ]),
          encryptedSeed: jest.fn().mockResolvedValue('johnnycryptoseed'),
        },
      },
      keyChainLib: {
        getPassword: jest.fn().mockResolvedValue('sekrit'),
      },
      encryptionLib: {
        decryptWithPass: () => 'newSeed',
      },
      identityWallet: { identity: { did: 'did:jolo:first' } },
      setIdentityWallet: jest.fn(() => Promise.resolve()),
    }

    const action = accountActions.checkIdentityExists
    // @ts-ignore
    await action(mockStore.dispatch, jest.fn().mockReturnValue(initialState), backendMiddleware)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('Should correctly handle an empty encrypted seed table', async () => {
    const backendMiddleware = {
      storageLib: {
        get: {
          persona: jest.fn().mockResolvedValue([]),
          encryptedSeed: jest.fn().mockResolvedValue(null),
        },
      },
    }

    // @ts-ignore
    await accountActions.checkIdentityExists(mockStore.dispatch, jest.fn().mockReturnValue(initialState), backendMiddleware)
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

    await accountActions.setClaimsForDid(
      mockStore.dispatch,
      jest.fn(),
      backendMiddleware,
    )

    expect(mockStore.getActions()).toMatchSnapshot()
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
          publicProfile: jest.fn().mockImplementation(() => {}),
        },
      },
      identityWallet,
    }

    const altMockStore = configureStore([
      thunk.withExtraArgument(backendMiddleware),
    ])(initialState)

    await accountActions.saveClaim(
      altMockStore.dispatch,
      jest.fn().mockReturnValue(initialState),
      backendMiddleware,
    )
    expect(altMockStore.getActions()).toMatchSnapshot()
  })
})
