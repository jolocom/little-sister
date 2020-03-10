import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import * as loading from 'src/actions/registration/loadingStages'
import { setDid } from 'src/actions/account'
import { ThunkAction } from 'src/store'
import { navigatorResetHome } from '../navigation'
import { setSeedPhraseSaved } from '../recovery'
import { scheduleNotification } from '../notifications'
import { createInfoNotification } from '../../lib/notifications'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'
import { validateMnemonic } from 'bip39'
import {
  ErrorScreenParams,
  ImageType,
} from '../../ui/errors/containers/errorScreen'
import { timeout } from '../../utils/asyncTimeout'

export const setLoadingMsg = (loadingMsg: string) => ({
  type: 'SET_LOADING_MSG',
  value: loadingMsg,
})

export const setIsRegistering = (value: boolean) => ({
  type: 'SET_IS_REGISTERING',
  value,
})

export const createIdentity = (encodedEntropy: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  dispatch(
    navigationActions.navigate({
      routeName: routeList.RegistrationProgress,
    }),
  )

  const isRegistering = getState().registration.loading.isRegistering
  if (isRegistering) return

  dispatch(setIsRegistering(true))

  dispatch(setLoadingMsg(loading.loadingStages[0]))
  await backendMiddleware.createKeyProvider(encodedEntropy)

  dispatch(setLoadingMsg(loading.loadingStages[1]))
  await backendMiddleware.fuelKeyWithEther()

  dispatch(setLoadingMsg(loading.loadingStages[2]))
  const identity = await backendMiddleware.createIdentity()

  dispatch(setDid(identity.did))
  dispatch(setLoadingMsg(loading.loadingStages[3]))
  dispatch(setIsRegistering(false))

  return dispatch(navigatorResetHome())
}

export const recoverIdentity = (mnemonic: string): ThunkAction => async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  dispatch(setIsRegistering(true))

  if (!validateMnemonic(mnemonic)) {
    await timeout(1000)
    dispatch(setIsRegistering(false))
    return dispatch(
      scheduleNotification(
        createInfoNotification({
          title: I18n.t(strings.YIKES),
          message: I18n.t(
            strings.LOOKS_LIKE_YOU_HAVE_THE_WRONG_SEED_PHRASE_PLEASE_GO_BACK_AND_TRY_AGAIN,
          ),
        }),
      ),
    )
  }

  let identity
  try {
    identity = await backendMiddleware.recoverIdentity(mnemonic)
  } catch (e) {
    dispatch(setIsRegistering(false))
    const params: ErrorScreenParams = {
      title: I18n.t(strings.DID_YOU_FORGET_YOUR_SEED_PHRASE),
      message: I18n.t(
        strings.BECAUSE_WEVE_NEVER_SEEN_THAT_ONE_BEFORE_PLEASE_TRY_AGAIN_WITH_A_DIFFERENT_SEED_PHRASE,
      ),
      image: ImageType.Red,
      interact: {
        label: I18n.t(strings.START_OVER),
        onInteract: () => {
          dispatch(
            navigationActions.navigate({
              routeName: routeList.InputSeedPhrase,
            }),
          )
        },
      },
      dismiss: {
        label: I18n.t(strings.CREATE_NEW_PROFILE),
        onDismiss: () => {
          dispatch(navigationActions.navigate({ routeName: routeList.Entropy }))
        },
      },
    }

    return dispatch(
      navigationActions.navigate({
        routeName: routeList.ErrorScreen,
        params,
      }),
    )
  }

  dispatch(setDid(identity.did))
  dispatch(setSeedPhraseSaved())

  dispatch(setIsRegistering(false))
  return dispatch(navigatorResetHome())
}
