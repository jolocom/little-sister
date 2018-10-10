import { registrationActions } from 'src/actions'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import data from './data/mockRegistrationData'
const MockDate = require('mockdate')
import { JolocomLib } from 'jolocom-lib'

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
          savePassword: jest.fn()
        }
      }

      const asyncAction = registrationActions.savePassword(mockPass)
      await asyncAction(mockStore.dispatch, mockGetState, mockMiddleware)

      expect(mockStore.getActions()).toMatchSnapshot()
      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledTimes(1)
      expect(mockMiddleware.keyChainLib.savePassword).toHaveBeenCalledWith(mockPass)
    })

    // it('should display exception screen in case of error', async () => {
    //   const mockMiddleware = {
    //     keyChainLib: {
    //       savePassword: jest.fn().mockRejectedValue({
    //         message: 'password could not be saved',
    //         stack: 'mock pass error stack'
    //       })
    //     }
    //   }

    //   const asyncAction = registrationActions.savePassword(mockPass)
    //   await asyncAction(mockStore.dispatch, mockGetState, mockMiddleware)
    //   expect(mockStore.getActions()[0].params.errorMessage).toContain('password could not be saved')
    // })
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

      const action  = registrationActions.startRegistration()
      action(mockStore.dispatch)
      expect(mockStore.getActions()).toMatchSnapshot()
    })
  })

  describe('createIdentity', () => {
    it('should attempt to create an identity', async () => {     
      MockDate.set(new Date(946681200000))
      
      const mockStore = configureStore([thunk])({})
      const { getPasswordResult, cipher, entropy, identityWallet } = data
  
      JolocomLib.registry.jolocom.create = jest.fn().mockReturnValue({
        create: () =>  identityWallet
      })

      const mockBackend = {
        identityWallet,
        ethereumLib: {
          requestEther: jest.fn(),
          privKeyToEthAddress: jest.fn().mockReturnValue('0x000test')
        },
        keyChainLib: {
          getPassword: jest.fn().mockResolvedValue(getPasswordResult)
        },
        encryptionLib: { encryptWithPass: jest.fn().mockReturnValue(cipher)},
        storageLib: {
          store: {
            persona: jest.fn(),
            derivedKey: jest.fn()
          }
        },
      }

      const mockGetState = () => {}
     
      const asyncAction = registrationActions.createIdentity(entropy)
      await asyncAction(mockStore.dispatch, mockGetState, mockBackend)

      expect(mockStore.getActions()).toMatchSnapshot()

      expect(mockBackend.keyChainLib.getPassword).toHaveBeenCalledTimes(1)
      expect(mockBackend.encryptionLib.encryptWithPass.mock.calls).toMatchSnapshot()
      expect(mockBackend.storageLib.store.persona.mock.calls).toMatchSnapshot()
      expect(mockBackend.storageLib.store.derivedKey.mock.calls).toMatchSnapshot()
      expect(mockBackend.ethereumLib.privKeyToEthAddress.mock.calls).toMatchSnapshot()
      expect(mockBackend.ethereumLib.requestEther.mock.calls).toMatchSnapshot()

      MockDate.reset()
    })

    // it('should display exception screen in case of error', async () => {
    //   const mockEntropy = 'abcd'
    //   const mockBackend = {
    //     jolocomLib: {
    //       identity: {
    //         create: jest.fn().mockRejectedValue({
    //           message: 'Mock registration error',
    //           stack: 'mock registration error stack trace'
    //         })
    //       }
    //     }
    //   }

    //   const mockStore = configureStore([thunk])({})
    //   const mockGetState = () => {}

    //   const asyncAction = registrationActions.createIdentity(mockEntropy)
    //   await asyncAction(mockStore.dispatch, mockGetState, mockBackend)
    //   expect(mockStore.getActions()[0].params.errorMessage).toContain('Invalid entropy')
    // })
  })
})
