import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { ThunkAction } from '../../store'
import { CredentialVerificationSummary } from '@jolocom/sdk/js/interactionManager/types'
import { Interaction } from '@jolocom/sdk'
import { cancelSSO, scheduleSuccessNotification } from './'
import { isEmpty } from 'ramda'
import { getUiCredentialTypeByType } from 'src/lib/util'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'

export const consumeCredentialRequest = (
  interaction: Interaction,
): ThunkAction => async (dispatch, getState, backendMiddleware) => {
  // TODO - Eugeniu
  // Must refactor this abomination.

  const credentialRequest =
    interaction.getMessages()[0].interactionToken as CredentialRequest
  const credentialsPerType = await Promise.all(
    credentialRequest.requestedCredentialTypes.map(t => {
      return interaction.getAttributesByType(t)
    }),
  )

  const populatedWithCredentials = await Promise.all(
    credentialsPerType.map(({ results, type }) =>
      isEmpty(results)
        ? [
            {
              type: getUiCredentialTypeByType(type),
              values: [],
              verifications: [],
            },
          ]
        : Promise.all(
            results.map(async ({ values, verification }) => ({
              type: getUiCredentialTypeByType(type),
              values,
              verifications: await interaction.getVerifiableCredential({
                id: verification,
              }),
            })),
          ),
    ),
  )

  const abbreviated = populatedWithCredentials.map(attribute =>
    attribute.map(entry => ({
      ...entry,
      verifications: entry.verifications.map((vCred: SignedCredential) => ({
        id: vCred.id,
        issuer: {
          did: vCred.issuer,
        },
        selfSigned: vCred.signer.did === getState().account.did.did,
        expires: vCred.expires,
      })),
    })),
  )

  return dispatch(
    navigationActions.navigate({
      routeName: routeList.Consent,
      params: {
        interactionId: interaction.id,
        interactionSummary: interaction.getSummary(),
        availableCredentials: abbreviated.reduce((acc, val) => acc.concat(val)),
      },
      key: 'credentialRequest',
    }),
  )
}

export const sendCredentialResponse = (
  selectedCredentials: CredentialVerificationSummary[],
  interactionId: string,
): ThunkAction => async (dispatch, getState, { interactionManager }) => {
  const interaction: Interaction = await interactionManager.getInteraction(
    interactionId,
  )

  const resp = await interaction.createCredentialResponse(
    selectedCredentials.map(c => c.id),
  )
  await interaction.send(resp)
  await interaction.processInteractionToken(resp)

  await dispatch(cancelSSO)
  return dispatch(scheduleSuccessNotification)
}
