import { AnyAction, Dispatch } from 'redux'
import { navigationActions, genericActions, accountActions } from 'src/actions/'
import { BackendMiddleware } from 'src/backendMiddleware'
import { routeList } from 'src/routeList'
import * as loading from 'src/actions/registration/loadingStages'
import { setDid } from 'src/actions/account'
import { JolocomLib } from 'jolocom-lib'
import { IpfsCustomConnector } from 'src/lib/ipfs'
import { jolocomEthereumResolver } from 'jolocom-lib/js/ethereum/ethereum'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
const bip39 = require('bip39')

export const setLoadingMsg = (loadingMsg: string) => {
  return {
    type: 'SET_LOADING_MSG',
    value: loadingMsg
  }
}

export const savePassword = (password: string) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    try {
      await backendMiddleware.keyChainLib.savePassword(password)
      dispatch(navigationActions.navigatorReset({ routeName: routeList.Entropy }))
    } catch (err) {
      dispatch(genericActions.showErrorScreen(err, routeList.Landing))
    }
  }
}

export const recoverIdentity = () => {
  return ( dispatch: Dispatch<AnyAction>) => {
    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.RecoverIdentity
      })
    )
  }
}

export const submitEntropy = (encodedEntropy: string) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.Loading
      })
    )

    dispatch(setLoadingMsg(loading.loadingStages[0]))

    setTimeout(() => {
      dispatch(createIdentity(encodedEntropy))
    }, 2000)
  }
}

export const startRegistration = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(
      navigationActions.navigatorReset({
        routeName: routeList.PasswordEntry
      })
    )
  }
}

export const finishRegistration = () => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(navigationActions.navigatorReset({ routeName: routeList.Home }))
  }
}

export const createIdentity = (encodedEntropy: string) => {
  return async (dispatch: Dispatch<AnyAction>, getState: Function, backendMiddleware: BackendMiddleware) => {
    const { ethereumLib, encryptionLib, keyChainLib, storageLib } = backendMiddleware
  
    try {
      const password = await keyChainLib.getPassword()
      const encEntropy = encryptionLib.encryptWithPass({ data: encodedEntropy, pass: password })
      const entropyData = {encryptedEntropy: encEntropy, timestamp: Date.now()}
      await storageLib.store.encryptedSeed(entropyData)
      const userVault = new SoftwareKeyProvider(Buffer.from(encodedEntropy, 'hex'), password)

      dispatch(setLoadingMsg(loading.loadingStages[1]))

      const ethAddr = ethereumLib.privKeyToEthAddress(userVault.getPrivateKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey
      }))

      await ethereumLib.requestEther(ethAddr)
      
      dispatch(setLoadingMsg(loading.loadingStages[2]))

      const registry = JolocomLib.registries.jolocom.create({
        ipfsConnector: new IpfsCustomConnector({
          host: 'ipfs.jolocom.com',
          port: 443,
          protocol: 'https'
        }),
        ethereumConnector: jolocomEthereumResolver
      })

      const identityWallet = await registry.create(userVault, password)

      const personaData = {
        did: identityWallet.identity.did,
        controllingKeyPath: JolocomLib.KeyTypes.jolocomIdentityKey
      }

      await storageLib.store.persona(personaData)
      dispatch(setDid(identityWallet.identity.did))

      dispatch(setLoadingMsg(loading.loadingStages[3]))
  
      dispatch(accountActions.setIdentityWallet())
      
      return dispatch(
        navigationActions.navigatorReset({
          routeName: routeList.SeedPhrase,
          params: { mnemonic: bip39.entropyToMnemonic(encodedEntropy) }
        })
      )
    } catch (error) {
      return dispatch(genericActions.showErrorScreen(error, routeList.Landing))
    }
  }
}
