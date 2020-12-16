import data from './account/mockRegistrationData'
import { createMockStore, RecursivePartial } from 'tests/utils'
import { RootState } from 'src/reducers'

import { onRestoreAccess } from 'src/actions/recovery';
import { entropyToMnemonic} from 'bip39'


describe('Account recovery actions', () => {
  const initialState: RecursivePartial<RootState> = {
    account: {
      did: {
        did: 'some did'
      }
    },
    generic: {
      disableLock: false
    },
    notifications: {
      queue: []
    }
  }
  const { identityWallet, entropy, getPasswordResult } = data
  const mnemonic = entropyToMnemonic(Buffer.from(entropy, 'hex'))
  const mockMethod = {
    recoverFromSeed: jest.fn()
  }

  const agent = {
    identityWallet,
    passwordStore: {
      getPassword: () => getPasswordResult
    },
    didMethod: mockMethod
  }
  const mockStore = createMockStore(initialState, agent)
  const { resetGenericPassword, getGenericPassword } = require('react-native-keychain')

  beforeEach(() => {
    mockStore.reset()
    resetGenericPassword.mockReset()
  })

  it('should correctly restore access for forgotten pin', async () => {
    mockMethod.recoverFromSeed.mockImplementationOnce(() => {
      return {
        identityWallet: agent.identityWallet
      }
    })
    getGenericPassword.mockImplementationOnce(() => {
      // this is called with { service: PIN_SERVICE } and should return a PIN
      // but we expect the resetGenericPassword method to have been called, and
      // this should be empty
      return ''
    })
    await mockStore.dispatch(onRestoreAccess(mnemonic.split(' ')))

    expect(mockMethod.recoverFromSeed).toHaveBeenCalledWith(Buffer.from(entropy, 'hex'), getPasswordResult)
    expect(resetGenericPassword).toHaveBeenCalledTimes(1)
    expect(getGenericPassword).toHaveBeenCalledTimes(1)
    expect(mockStore.getActions()).toMatchSnapshot()
  })

  it('should not restore access for incorrect mnemonic', async () => {
    const badEntropy = Buffer.from(entropy.replace('2', '4'), 'hex')
    const badMnemonic = entropyToMnemonic(badEntropy)
    mockMethod.recoverFromSeed.mockImplementationOnce(() => {
      return {
        identityWallet: {
          did: 'did:not:'
        }
      }
    })
    getGenericPassword.mockImplementationOnce(() => {
      // this is called with { service: PIN_SERVICE } and should return a PIN
      return 'TESTPIN'
    })
    await mockStore.dispatch(onRestoreAccess(badMnemonic.split(' ')))

    expect(mockMethod.recoverFromSeed).toHaveBeenCalledWith(badEntropy, getPasswordResult)
    expect(resetGenericPassword).toHaveBeenCalledTimes(0)
    expect(getGenericPassword).toHaveBeenCalledTimes(1)
    expect(mockStore.getActions()).toMatchSnapshot()
  })
})
