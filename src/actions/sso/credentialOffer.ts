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
  SignedCredentialWithMetadata,
  CredentialOfferFlowState,
} from '@jolocom/sdk/js/interactionManager/types'
import { CredentialOfferFlow } from '@jolocom/sdk/js/interactionManager/credentialOfferFlow'
import { isEmpty } from 'ramda'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { cancelSSO } from './index'
import { Interaction } from '@jolocom/sdk'

export const consumeCredentialOfferRequest = (
  interaction: Interaction,
): ThunkAction => async (dispatch, getState, { interactionManager }) => {
  const interactionSummary = interaction.getSummary()
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.CredentialReceive,
      params: {
        interactionId: interaction.id,
        interactionSummary,
        invalidTypes: [],
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
  const interaction = await interactionManager.getInteraction(interactionId)

  const response = await interaction.createCredentialOfferResponseToken(
    selectedSignedCredentialWithMetadata,
  )
  await interaction.processInteractionToken(response)
  await interaction.send(response)

  return dispatch(
    validateSelectionAndSave(
      selectedSignedCredentialWithMetadata,
      interaction.id,
    ),
  )
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

const getCredentialType = (cred: SignedCredential) =>
  cred.type[cred.type.length - 1]

export const validateSelectionAndSave = (
  selectedCredentials: SignedCredentialWithMetadata[],
  interactionId: string,
): ThunkAction => async (dispatch, getState, { interactionManager }) => {
  const interaction = await interactionManager.getInteraction(interactionId)
  const { offerSummary, issued, credentialsValidity } = interaction.getSummary()
    .state as CredentialOfferFlowState

  const selectedTypes = selectedCredentials.map(el => el.type)
  const toSave = issued.map(credential =>
    selectedTypes.includes(getCredentialType(credential)) ? credential : null,
  )

  const duplicates = await isCredentialStored(toSave, id =>
    interaction.getStoredCredentialById(id),
  )

  const issuanceResult = (interaction.flow as CredentialOfferFlow).getIssuanceResult()

  const invalidTypes = toSave.reduce<string[]>((acc, cred, i) => {
    const isValid =
      credentialsValidity[i] &&
      !issuanceResult[i].validationErrors.invalidIssuer &&
      !issuanceResult[i].validationErrors.invalidSubject &&
      !duplicates[i]

    if (cred && !isValid) acc.push(getCredentialType(cred))
    return acc
  }, [])

  // None passed the validation
  const allInvalid = invalidTypes.length === issued.length
  const allValid = invalidTypes.length === 0

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
    return dispatch(cancelSSO)
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
      storage.store.credentialMetadata,
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
    return dispatch(cancelSSO)
  }

  dispatch(
    scheduleInvalidNotification(
      I18n.t(strings.SOMETHING_WENT_WRONG_CHOOSE_AGAIN),
    ),
  )

  // The screen is borked. Save is enabled by default. Not sure what's wrong
  return dispatch(
    navigationActions.navigate(
      {
        routeName: routeList.CredentialReceiveNegotiate,
        params: {
          interactionId,
          interactionSummary: {
            ...interaction.getSummary(),
            state: { ...interaction.getSummary().state, offerSummary },
          },
          invalidTypes,
        },
      },
      true,
    ),
  )
}

/**
 * Helper function to check if a credential with a given ID is already stored in the wallet,
 * used to detect "duplicate" offers
 */

const isCredentialStored = async (
  offer: Array<SignedCredential | null>,
  getCredential: (id: string) => Promise<SignedCredential[]>,
) =>
  Promise.all(
    offer.map(async signedCredential =>
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
