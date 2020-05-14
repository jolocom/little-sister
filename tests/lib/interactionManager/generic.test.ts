import { InteractionChannel } from 'src/lib/interactionManager/types'
import { SoftwareKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import {
  userIdentityData,
  remoteIdentityData,
  createUserBackendMiddleware,
  createRemoteBackendMiddleware,
  initIdentityWallet,
} from './interactionManager.data'
import { GenericFlow } from 'src/lib/interactionManager/genericFlow'
import { Interaction } from 'src/lib/interactionManager/interaction'

describe.only('Generic Flow', () => {
  SoftwareKeyProvider.verify = jest.fn().mockImplementation(() => true)

  const userBackendMiddleware = createUserBackendMiddleware()
  const remoteBackendMiddleware = createRemoteBackendMiddleware()
  let interaction: Interaction

  beforeAll(async () => {
    await initIdentityWallet(
      userBackendMiddleware,
      userIdentityData.didDocument.getDID(),
    )
    await initIdentityWallet(
      remoteBackendMiddleware,
      remoteIdentityData.didDocument.getDID(),
    )
  })

  const genericArgs = {
    body: { answer: 42 },
    callbackURL: 'http://test.jolocom.io/auth',
  }

  it('should initiate the flow with the right interaction type, holding the correct state', async () => {
    const request = await remoteBackendMiddleware.identityWallet.create.interactionTokens.request.generic(
      genericArgs,
      remoteIdentityData.encryptionPass,
    )

    interaction = await userBackendMiddleware.interactionManager.start(
      InteractionChannel.HTTP,
      request,
    )

    expect(interaction.flow).toBeInstanceOf(GenericFlow)

    expect(interaction.flow.getState()).toEqual({
      body: genericArgs.body,
    })

    const responseToken = await interaction.createGenericResponse({
      callbackURL: request.interactionToken.callbackURL,
      body: {
        answer: 42
      }
    })

    expect(responseToken.interactionToken.body).toEqual(
      genericArgs,
    )
  })
})
