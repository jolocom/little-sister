import { registrationActions } from 'src/actions'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import data from './data/mockRegistrationData'
import { JolocomLib } from 'jolocom-lib'
import * as util from 'src/lib/util'
import { withErrorHandling } from '../../../src/actions/modifiers'
import { showErrorScreen } from '../../../src/actions/generic'
import { AppError, ErrorCode } from '../../../src/lib/errors'
import { routeList } from '../../../src/routeList'

const MockDate = require('mockdate')

describe('Registration action creators', () => {
  describe('submitEntropy', () => {
    it('should correctly navigate to route and provide the entropy', () => {
      const action = registrationActions.submitEntropy('mockEntropy')
      const mockStore = configureStore([thunk])({})

      action(mockStore.dispatch, mockStore.getState, null)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })

  describe('startRegistration', () => {
    it('should save a password and initiate the registration process', async () => {
      const randomPassword = 'hunter0='
      // @ts-ignore assigning to readonly property
      util.generateSecureRandomBytes = () =>
        Buffer.from(randomPassword, 'base64')
      const mockStore = configureStore([thunk])({})
      const mockMiddleware = {
        keyChainLib: {
          savePassword: jest.fn(),
        },
      }

      await registrationActions.startRegistration(
        mockStore.dispatch,
        mockStore.getState,
        mockMiddleware,
      )

      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledTimes(1)
      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledWith(
        randomPassword,
      )
      expect(mockStore.getActions()).toMatchSnapshot()
    })

    it('should display exception screen in case of error', async () => {
      const mockStore = configureStore([thunk])({})
      const mockMiddleware = {
        keyChainLib: {
          savePassword: jest.fn().mockRejectedValue({
            message: 'password could not be saved',
            stack: 'mock start registration error stack',
          }),
        },
      }

      await mockStore.dispatch(
        withErrorHandling(
          showErrorScreen,
          (err: AppError) =>
            new AppError(ErrorCode.RegistrationFailed, err, routeList.Landing),
        )(
          registrationActions.startRegistration(
            mockStore.dispatch,
            mockStore.getState,
            mockMiddleware,
          ),
        ),
      )

      expect(mockStore.getActions()[0].routeName).toContain('Exception')
      expect(mockStore.getActions()[0].params.returnTo).toBe('Landing')
    })
  })

  describe('createIdentity', () => {
    it('should attempt to create an identity', async () => {
      MockDate.set(new Date(946681200000))
      const { getPasswordResult, cipher, entropy, identityWallet } = data
      JolocomLib.util.fuelKeyWithEther = jest.fn()
      const mockBackend = {
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

      const mockStore = configureStore([thunk.withExtraArgument(mockBackend)])(
        {},
      )

      const asyncAction = registrationActions.createIdentity(entropy)
      await asyncAction(mockStore.dispatch, mockStore.getState, mockBackend)

      expect(mockStore.getActions()).toMatchSnapshot()

      expect(mockBackend.keyChainLib.getPassword).toHaveBeenCalledTimes(1)
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

    it('should display exception screen in case of error', async () => {
      const mockEntropy = 'abcd'
      const mockBackend = {
        keyChainLib: {
          getPassword: jest.fn().mockRejectedValue('MockError'),
        },
      }

      const mockStore = configureStore([thunk])({})

      const asyncAction = registrationActions.createIdentity(mockEntropy)

      await mockStore.dispatch(
        withErrorHandling(
          showErrorScreen,
          (err: AppError) =>
            new AppError(ErrorCode.RegistrationFailed, err, routeList.Landing),
        )(asyncAction(mockStore.dispatch, mockStore.getState, mockBackend)),
      )

      expect(mockStore.getActions()[0].routeName).toContain('Exception')
      expect(mockStore.getActions()[0].params.returnTo).toBe('Landing')
    })
  })
})
