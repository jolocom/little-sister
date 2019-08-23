import { BackendMiddleware, BackendError } from 'src/backendMiddleware'
import { stub, reveal } from './utils'
import { ConnectionOptions } from 'typeorm/browser'
import data from 'tests/actions/registration/data/mockRegistrationData'
import { JolocomLib } from 'jolocom-lib'
import { IRegistry } from 'jolocom-lib/js/registries/types'

const MockDate = require('mockdate')

const mockBackendMiddlewareConfig = {
  fuelingEndpoint: 'hptp://petrol1.station',
  typeOrmConfig: {} as ConnectionOptions,
}

describe('BackendMiddleware', () => {
  const { getPasswordResult, cipher, entropy, identityWallet } = data
  const getPassword = jest.fn().mockResolvedValue(getPasswordResult)
  const encryptWithPass = jest.fn().mockReturnValue(cipher)
  const decryptWithPass = jest.fn().mockReturnValue(entropy)
  const storageLib = {
    store: stub<BackendMiddleware['storageLib']['store']>(),
    get: stub<BackendMiddleware['storageLib']['get']>({
      encryptedSeed: jest.fn().mockResolvedValue(cipher),
    }),
  }
  const registry = stub<IRegistry>()

  const createBackendMiddleware = (): BackendMiddleware => {
    const backendMiddleware = new BackendMiddleware(mockBackendMiddlewareConfig)
    Object.assign(backendMiddleware, {
      keyChainLib: { getPassword },
      encryptionLib: { encryptWithPass, decryptWithPass },
      storageLib,
      registry,
    })
    return backendMiddleware
  }

  describe('prepareIdentityWallet', () => {
    const backendMiddleware = createBackendMiddleware()

    it('should throw NoEntropy if there is no stored entropy', async () => {
      reveal(storageLib.get).encryptedSeed.mockResolvedValueOnce(null)
      const walletPromise = backendMiddleware.prepareIdentityWallet()
      return expect(walletPromise).rejects.toThrow(BackendError.codes.NoEntropy)
    })

    it('should throw DecryptionFailed if decryption fails', async () => {
      decryptWithPass.mockReturnValueOnce(null)
      const walletPromise = backendMiddleware.prepareIdentityWallet()
      return expect(walletPromise).rejects.toThrow(
        BackendError.codes.DecryptionFailed,
      )
    })

    it('should authenticate and cache the identity if not cached', async () => {
      reveal(storageLib.get).didDoc.mockResolvedValueOnce(null)
      reveal(registry).authenticate.mockResolvedValue(identityWallet)

      await backendMiddleware.prepareIdentityWallet()
      expect(reveal(registry).authenticate.mock.calls).toMatchSnapshot()
      expect(reveal(storageLib.get).didDoc.mock.calls).toMatchSnapshot()
      expect(storageLib.store.didDoc).toHaveBeenCalledWith(
        identityWallet.didDocument,
      )
      expect(() => backendMiddleware.identityWallet).not.toThrow()
    })

    it('should use cached identity if available', async () => {
      stub.clearMocks(registry)
      stub.clearMocks(storageLib.store)
      reveal(storageLib.get).didDoc.mockResolvedValueOnce(
        identityWallet.didDocument,
      )

      await backendMiddleware.prepareIdentityWallet()
      expect(reveal(registry).authenticate).not.toHaveBeenCalled()
      expect(storageLib.store.didDoc).not.toHaveBeenCalled()

      expect(() => backendMiddleware.identityWallet).not.toThrow()
      expect(backendMiddleware.identityWallet.identity.did).toMatch(
        identityWallet.didDocument.did,
      )
    })
  })

  describe('Identity Creation', () => {
    const backendMiddleware = createBackendMiddleware()
    let entropyData: { encryptedEntropy: string; timestamp: number }

    beforeAll(() => {
      MockDate.set(new Date(946681200000))
      entropyData = {
        encryptedEntropy: cipher,
        timestamp: Date.now(),
      }
    })

    afterAll(() => MockDate.reset())

    it('should throw NoKeyProvider from fuelKeyWithEther if no entropy was set', async () => {
      const fuelPromise = backendMiddleware.fuelKeyWithEther()
      return expect(fuelPromise).rejects.toThrow(
        BackendError.codes.NoKeyProvider,
      )
    })

    it('should throw NoKeyProvider from createIdentity if no entropy was set', async () => {
      const identityPromise = backendMiddleware.createIdentity()
      return expect(identityPromise).rejects.toThrow(
        BackendError.codes.NoKeyProvider,
      )
    })

    it('should throw NoKeyProvider from fuelKeyWithEther if no entropy was set', async () => {
      const fuelPromise = backendMiddleware.fuelKeyWithEther()
      return expect(fuelPromise).rejects.toThrow(
        BackendError.codes.NoKeyProvider,
      )
    })

    it('should create a keyProvider on setEntropy', async () => {
      getPassword.mockClear()
      encryptWithPass.mockClear()

      await backendMiddleware.setEntropy(entropy)

      expect(getPassword).toHaveBeenCalledTimes(1)
      expect(encryptWithPass.mock.calls).toMatchSnapshot()
      expect(backendMiddleware.entropyData).toMatchObject(entropyData)
      expect(() => backendMiddleware.keyProvider).not.toThrow()
    })

    it('should not store anything before the identity is registered', () => {
      expect(storageLib.store.didDoc).not.toHaveBeenCalled()
      expect(storageLib.store.persona).not.toHaveBeenCalled()
      expect(storageLib.store.encryptedSeed).not.toHaveBeenCalled()
    })

    it('should fuelKeyWithEther', async () => {
      const fuelSpy = jest
        .spyOn(JolocomLib.util, 'fuelKeyWithEther')
        .mockResolvedValueOnce(null)

      await backendMiddleware.fuelKeyWithEther()
      expect(fuelSpy.mock.calls).toMatchSnapshot()
    })

    it('should register the identity and store the entropy on createIdentity', async () => {
      reveal(registry).create.mockResolvedValue(identityWallet)

      const identity = await backendMiddleware.createIdentity()

      expect(registry.create).toHaveBeenCalledWith(
        backendMiddleware.keyProvider,
        getPasswordResult,
      )
      expect(storageLib.store.didDoc).toHaveBeenCalledWith(
        identityWallet.didDocument,
      )
      expect(storageLib.store.persona).toHaveBeenCalledWith({
        did: identity.did,
        controllingKeyPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      })

      expect(storageLib.store.encryptedSeed).toHaveBeenCalledWith(entropyData)
    })
  })
})
