import { registrationActions } from 'src/actions'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import data from './data/mockRegistrationData'
import { JolocomLib } from 'jolocom-lib';
import { getJestConfig } from "ts-jest/dist/test-utils";
const MockDate = require('mockdate')

describe('Registration action creators', () => {
  describe('savePassword', () => {
    const mockGetState = () => {}
    const mockStore = configureStore([thunk])({})
    const mockPass = 'secret123'

    afterEach(() => {
      mockStore.clearActions()
    })
    it('should attempt to save the password in the keychain', async () => {
      const mockMiddleware = {
        keyChainLib: {
          savePassword: jest.fn(),
        },
      }

      const asyncAction = registrationActions.savePassword(mockPass)
      await asyncAction(mockStore.dispatch, mockGetState, mockMiddleware)

      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledTimes(1)
      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledWith(
        mockPass,
      )
    })

    it('should display exception screen in case of error', async () => {
      const mockMiddleware = {
        keyChainLib: {
          savePassword: jest.fn().mockRejectedValue({
            message: 'password could not be saved',
            stack: 'mock pass error stack',
          }),
        },
      }

      const asyncAction = registrationActions.savePassword(mockPass)
      await asyncAction(mockStore.dispatch, mockGetState, mockMiddleware)

      expect(mockStore.getActions()[0].routeName).toContain('Exception')
      expect(mockStore.getActions()[0].params.returnTo).toBe('Landing')
    })
  })

  describe('submitEntropy', () => {
    it('should correctly navigate to route and provide the entropy', () => {
      const action = registrationActions.submitEntropy('mockEntropy')
      const mockStore = configureStore([thunk])({})

      action(mockStore.dispatch)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })

  describe('startRegistration', () => {
    const mockGetState = () => {}

    it('should initiate the registration process', async () => {
      const mockStore = configureStore([thunk])({})

      const action = registrationActions.startRegistration()
      action(mockStore.dispatch)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })

  describe('createIdentity and recoverIdentity', () => {
    const { getPasswordResult, cipher, entropy, mnemonic, identityWallet } = data
    let mockBackend
    beforeAll(() => {
      MockDate.set(new Date(946681200000))
      const { getPasswordResult, cipher, entropy, mnemonic, identityWallet } = data
      JolocomLib.util.fuelKeyWithEther = jest.fn();
      mockBackend = {
        identityWallet,
        keyChainLib: {
          getPassword: jest.fn().mockResolvedValue(getPasswordResult),
        },
        encryptionLib: {
          encryptWithPass: jest.fn().mockReturnValue(cipher),
          decryptWithPass: jest.fn().mockReturnValue(entropy),
        },
        storageLib: {
          store: {
            persona: jest.fn(),
            derivedKey: jest.fn(),
            encryptedSeed: jest.fn(),
          },
          get: {
            persona: jest.fn().mockResolvedValue([{ did: 'did:jolo:first' }]),
            encryptedSeed: jest.fn().mockResolvedValue('johnnycryptoseed'),
          },
        },
        registry: {
          create: () => identityWallet,
        },
        setIdentityWallet: jest.fn(() => Promise.resolve()),
      }

      afterEach(() => {
        // clear call counter of mock functions
        jest.clearAllMocks()
      })
      it('should attempt to create an identity', async () => {

      const mockStore = configureStore([thunk.withExtraArgument(mockBackend)])(
        {},
      )

      const mockGetState = () => {}

      const asyncAction = registrationActions.createIdentity(entropy)
      await asyncAction(mockStore.dispatch, mockGetState, mockBackend)

      expect(mockStore.getActions()).toMatchSnapshot()

      expect(mockBackend.keyChainLib.getPassword).toHaveBeenCalledTimes(2)
      expect(
        mockBackend.encryptionLib.encryptWithPass.mock.calls,
      ).toMatchSnapshot()
      expect(mockBackend.storageLib.store.persona.mock.calls).toMatchSnapshot()
      expect(
        mockBackend.storageLib.store.derivedKey.mock.calls,
      ).toMatchSnapshot()
      expect(JolocomLib.util.fuelKeyWithEther.mock.calls).toMatchSnapshot()
      MockDate.reset()
    })
    it('should attempt to recover an identity', async () => {

      const mockStore = configureStore([thunk.withExtraArgument(mockBackend)])({})

      const mockGetState = () => { }

      const asyncAction = registrationActions.recoverIdentity(mnemonic)
      await asyncAction(mockStore.dispatch, mockGetState, mockBackend)

      expect(mockStore.getActions()).toMatchSnapshot()

      expect(mockBackend.keyChainLib.getPassword).toHaveBeenCalledTimes(1)
      expect(mockBackend.encryptionLib.encryptWithPass.mock.calls).toMatchSnapshot()
      expect(mockBackend.storageLib.store.persona.mock.calls).toMatchSnapshot()
      expect(mockBackend.storageLib.store.derivedKey.mock.calls).toMatchSnapshot()

      MockDate.reset()
    })
    it('should display exception screen in case of error', async () => {
      const mockEntropy = 'abcd'
      const mockBackend = {
        keyChainLib: {
          getPassword: jest.fn().mockRejectedValue('MockError'),
        },
      }

      const mockStore = configureStore([thunk])({})
      const mockGetState = () => {}

      const asyncAction = registrationActions.createIdentity(mockEntropy)
      await asyncAction(mockStore.dispatch, mockGetState, mockBackend)

      expect(mockStore.getActions()[0].routeName).toContain('Exception')
      expect(mockStore.getActions()[0].params.returnTo).toBe('Landing')
    })
  })
})
