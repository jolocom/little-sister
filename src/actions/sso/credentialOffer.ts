import { JSONWebToken } from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { ThunkAction } from '../../store'
import { navigationActions } from '../index'
import { routeList } from '../../routeList'
import { setClaimsForDid } from '../account'
import { checkRecoverySetup } from '../notifications/checkRecoverySetup'
import { createInfoNotification, Notification } from '../../lib/notifications'
import { scheduleNotification } from '../notifications'
import I18n from 'src/locales/i18n'
import strings from '../../locales/strings'
import {
  InteractionTransportType,
  SignedCredentialWithMetadata,
  CredentialOfferFlowState,
} from '@jolocom/sdk/js/src/lib/interactionManager/types'
import { isEmpty } from 'ramda'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { cancelSSO } from './index'

export const consumeCredentialOfferRequest = (
  credentialOfferRequest: JSONWebToken<CredentialOfferRequest>,
  interactionChannel: InteractionTransportType,
): ThunkAction => async (dispatch, getState, { interactionManager }) => {
  const interaction = await interactionManager.start(
    interactionChannel,
    credentialOfferRequest,
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.CredentialReceive,
      params: {
        interactionId: credentialOfferRequest.nonce,
        interactionSummary: interaction.getSummary(),
        passedValidation: (interaction.getSummary().state as CredentialOfferFlowState)
          .offerSummary.map(_ => true)
      },
    }),
  )
}

/**
 * Given the ID for a {@link CredentialOfferFlow}, and an array representing a user selection,
 * will attempt to create the correct {@link CredentialOfferResponse} token, and pass it to the interaction
 * class instance to move the interaction forward.
 * @todo - interaction.send can throw, this is not currently handled.
 */

export const consumeCredentialReceive = (
  selectedSignedCredentialWithMetadata: SignedCredentialWithMetadata[],
  interactionId: string,
): ThunkAction => async (dispatch, getState, { interactionManager }) => {
  const interaction = interactionManager.getInteraction(interactionId)

  const response = await interaction
    .createCredentialOfferResponseToken(selectedSignedCredentialWithMetadata)

  await interaction.processInteractionToken(response)

  const credentialReceive = await interaction.send(
    await interaction.createCredentialOfferResponseToken(
      selectedSignedCredentialWithMetadata,
    ),
  )

  if (credentialReceive) {
    await interaction.processInteractionToken(credentialReceive)
    return dispatch(
      validateSelectionAndSave(
        selectedSignedCredentialWithMetadata,
        interaction.id,
      ),
    )
  }
}

/**
 * Given the ID for a {@link CredentialOfferFlow}, and an array representing a user selection,
 * will ensure that the user selection is sane (i.e. the user selected credentials from the offer),
 * and navigate accordingly.
 * In case the selection is sane, we try store the selected credentials and navigate to home.
 * In case the selection contains SOME entries which can't be saved (i.e. wrong issuer / subject, already stored),
 * we navigate to the selection screen again, with the problematic credentials marked as invalid (and therefore unselectable)
 * In case the selection contains NO entries that can be saved, a error notification is rendered, and the interaction is ended.
 *
 * @dev This function can eventually be simplified. It currently contains a bunch of logic which is not well abstracted / does not fit anywhere else
 * (e.g. checking for duplicates)
 */

export const validateSelectionAndSave = (
  selectedCredentials: SignedCredentialWithMetadata[],
  interactionId: string,
): ThunkAction => async (
  dispatch,
  getState,
  { interactionManager, storageLib },
) => {
  const interaction = interactionManager.getInteraction(interactionId)
  const { offerSummary, issued } = interaction.getSummary()
    .state as CredentialOfferFlowState

  const selectedTypes = selectedCredentials.map(el => el.type)
  const toSave = issued.filter(credential => selectedTypes.includes(credential.type[1]))

  // if (toSave.length !== selectedCredentials.length) {}

  const duplicates = await isCredentialStored(
    toSave,
    id => interaction.getStoredCredentialById(id)
  )

  // TODO update to the latest version of the SDK and && the signature check as well
  const passedValidation = toSave.map(
    (credential, i) =>
      credential.signer.did === interaction.participants.requester!.did &&
      credential.claim.id === getState().account.did.did &&
      !duplicates[i],
  )

  // None passed the validation
  const allInvalid = !passedValidation.includes(true)
  // At least one passed the validatio
  const allValid = !passedValidation.includes(false)

  const scheduleInvalidNotification = (message: string) =>
    scheduleNotification(
      createInfoNotification({
        title: I18n.t(strings.AWKWARD),
        message,
      }),
    )

  if (allInvalid) {
    dispatch(
      scheduleInvalidNotification(
        I18n.t(strings.IT_SEEMS_LIKE_WE_CANT_DO_THIS),
      ),
    )
    return dispatch(endReceiving(interactionId))
  }

  if (allValid) {
    await interaction.storeSelectedCredentials()
    await interaction.storeIssuerProfile()
    await interaction.storeCredentialMetadata()

    /*
    await storeOfferMetadata(
      (interaction.getSummary().state as CredentialOfferFlowState).offerSummary,
      interaction.participants.requester!.did,
      //@ts-ignore
      storageLib.store.credentialMetadata,
    )
    */

    dispatch(checkRecoverySetup)
    //TODO @mnzaki can we avoid running the FULL setClaimsForDid
    dispatch(setClaimsForDid)

    const notification: Notification = createInfoNotification({
      title: I18n.t(strings.GREAT_SUCCESS),
      message: I18n.t(
        strings.YOU_CAN_FIND_YOUR_NEW_CREDENTIAL_IN_THE_DOCUMENTS,
      ),
      interact: {
        label: I18n.t(strings.OPEN),
        onInteract: () => {
          dispatch(
            navigationActions.navigate({ routeName: routeList.Documents }),
          )
        },
      },
    })

    dispatch(scheduleNotification(notification))
    return dispatch(endReceiving(interactionId))
  }

  dispatch(
    scheduleInvalidNotification(
      I18n.t(strings.SOMETHING_WENT_WRONG_CHOOSE_AGAIN),
    ),
  )

  // The screen is borked. Save is enabled by default. Not sure what's wrong
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.CredentialReceiveNegotiate,
      params: {
        interactionId,
        interactionSummary: {
          ...interaction.getSummary(),
          state: { offerSummary },
        },
        passedValidation
      },
    }),
  )
}

/**
 * Helper function to check if a credential with a given ID is already stored in the wallet,
 * used to detect "duplicate" offers
 */

const isCredentialStored = async (
  offer: SignedCredential[],
  getCredential: (id: string) => Promise<SignedCredential[]>,
) =>
  Promise.all(
    offer.map(async (signedCredential) =>
      signedCredential
        ? !isEmpty(await getCredential(signedCredential.id))
        : false,
    ),
  )

/**
 * @todo currently the only helper which takes a function as an arg instead of a reference to the (in this instance)
 * storage class. Does this need to change for consistency?
 */

//const storeOfferMetadata = async (
//  offer: SignedCredentialWithMetadata[],
//  did: string,
//  storeCredentialMetadata: (
//    a: CredentialMetadataSummary,
//  ) => Promise<CacheEntity>,
//) =>
//  Promise.all(
//    uniqBy(
//      detail => `${detail.issuer.did}${detail.type}`,
//      offer.map(({ type, renderInfo, metadata }) => ({
//        // TODO Why isn't the did already in the summary type? This feels hacky
//        issuer: { did },
//        type,
//        renderInfo: renderInfo || {},
//        metadata: metadata || {},
//      })),
//    ).map(storeCredentialMetadata),
//  )
//
const endReceiving = (interactionId: string): ThunkAction => (
  dispatch,
  getState,
  { interactionManager },
) => {
  const interaction = interactionManager.getInteraction(interactionId)
  const { desc: transportDesc } = interaction.transportAPI

  if (
    transportDesc &&
    transportDesc.type === InteractionTransportType.Deeplink
  ) {
    return dispatch(navigationActions.navigatorResetHome())
  } else {
    return dispatch(cancelSSO)
  }
}
