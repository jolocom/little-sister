import { CredentialOfferFlow } from './credentialOfferFlow'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { BackendMiddleware } from '../../backendMiddleware'
import {
  InteractionChannel,
  InteractionSummary,
  SignedCredentialWithMetadata,
  CredentialVerificationSummary,
  AuthenticationFlowState,
} from './types'
import { CredentialRequestFlow } from './credentialRequestFlow'
import { JolocomLib } from 'jolocom-lib'
import { CredentialMetadataSummary } from '../storage/storage'
import { Flow } from './flow'
import { last } from 'ramda'
import { CredentialOfferRequest } from 'jolocom-lib/js/interactionTokens/credentialOfferRequest'
import { AuthenticationFlow } from './authenticationFlow'
import { CredentialRequest } from 'jolocom-lib/js/interactionTokens/credentialRequest'
import { Linking } from 'react-native'
import { AppError, ErrorCode } from '../errors'
import { Authentication } from 'jolocom-lib/js/interactionTokens/authentication'
import { Identity } from 'jolocom-lib/js/identity/identity'
import { generateIdentitySummary } from 'src/actions/sso/utils'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { EncryptionFlow } from './encryptionFlow'
import { RPCRequest } from './rpc'
import { GenericFlow } from './genericFlow'
import { Generic } from 'jolocom-lib/js/interactionTokens/genericToken'
import { IGenericAttrs } from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { CallType, EncryptionRequest } from './rpc'

/***
 * - initiated by InteractionManager when an interaction starts
 * - handles the communication channel of the interaction
 * - holds the instance of the particular interaction (e.g. CredentialOffer, Authentication)
 */

const interactionFlowForMessage = {
  [InteractionType.CredentialOfferRequest]: CredentialOfferFlow,
  [InteractionType.CredentialRequest]: CredentialRequestFlow,
  [InteractionType.Authentication]: AuthenticationFlow,
  [InteractionType.Generic]: GenericFlow,
}

export class Interaction {
  private interactionMessages: JSONWebToken<JWTEncodable>[] = []
  public id: string
  public ctx: BackendMiddleware
  public flow: Flow

  // The channel through which the request (first token) came in
  public channel: InteractionChannel

  public participants!: {
    us: Identity
    them: Identity
  }

  public constructor(
    ctx: BackendMiddleware,
    channel: InteractionChannel,
    id: string,
    interactionType: InteractionType,
  ) {
    this.ctx = ctx
    this.channel = channel
    this.id = id
    this.flow = new interactionFlowForMessage[interactionType](this)
  }

  public getMessages() {
    return this.interactionMessages
  }

  private findMessageByType(type: InteractionType) {
    return this.getMessages().find(
      ({ interactionType }) => interactionType === type,
    )
  }

  // TODO Try to write a respond function that collapses these
  public async createAuthenticationResponse() {
    const request = this.findMessageByType(
      InteractionType.Authentication,
    ) as JSONWebToken<Authentication>
    const { description } = this.getSummary().state as AuthenticationFlowState

    return this.ctx.identityWallet.create.interactionTokens.response.auth(
      {
        description,
        callbackURL: request.interactionToken.callbackURL,
      },
      await this.ctx.keyChainLib.getPassword(),
      request,
    )
  }

  public async createCredentialResponse(
    selectedCredentials: CredentialVerificationSummary[],
  ) {
    const request = this.findMessageByType(
      InteractionType.CredentialRequest,
    ) as JSONWebToken<CredentialRequest>

    const credentials = await Promise.all(
      selectedCredentials.map(
        async ({ id }) => (await this.getVerifiableCredential({ id }))[0],
      ),
    )

    return this.ctx.identityWallet.create.interactionTokens.response.share(
      {
        callbackURL: request.interactionToken.callbackURL,
        suppliedCredentials: credentials.map(c => c.toJSON()),
      },
      await this.ctx.keyChainLib.getPassword(),
      request,
    )
  }

  public async createCredentialOfferResponseToken(
    selectedOffering: SignedCredentialWithMetadata[],
  ) {
    const credentialOfferRequest = this.findMessageByType(
      InteractionType.CredentialOfferRequest,
    ) as JSONWebToken<CredentialOfferRequest>

    const credentialOfferResponseAttr = {
      callbackURL: credentialOfferRequest.interactionToken.callbackURL,
      selectedCredentials: selectedOffering.map(offer => ({
        type: offer.type,
      })),
    }

    return this.ctx.identityWallet.create.interactionTokens.response.offer(
      credentialOfferResponseAttr,
      await this.ctx.keyChainLib.getPassword(),
      credentialOfferRequest,
    )
  }

  public async createEncResponseToken() {
    const encRequest = this.findMessageByType(
      InteractionType.Generic,
    ) as JSONWebToken<EncryptionRequest>

    return this.ctx.identityWallet.create.interactionTokens.response.generic(
      {
        callbackURL: encRequest.payload.interactionToken!.callbackURL,
        body: {
          result: JSON.stringify(
            // @ts-ignore
            await this.ctx.identityWallet._vaultedKeyProvider.encryptHybrid(
              encRequest.payload.interactionToken!.body.request,
              {
                derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
                encryptionPass: await this.ctx.keyChainLib.getPassword(),
              },
            ),
          ),
          rpc: CallType.AsymEncrypt,
        },
      },
      await this.ctx.keyChainLib.getPassword(),
      genericRequest,
    )
  }

  // public async createDecResponseToken() {
  //   const encRequest = this.findMessageByType(
  //     InteractionType.Generic,
  //   ) as JSONWebToken<EncryptionRequest>

  //   return this.ctx.identityWallet.create.interactionTokens.response.generic<
  //     EncryptionResponse
  //   >(
  //     {
  //       callbackURL: encRequest.payload.interactionToken!.callbackURL,
  //       // @ts-ignore
  //       body: {
  //         result: JSON.stringify(
  //           await this.ctx.identityWallet._vaultedKeyProvider.encryptHybrid(
  //             encRequest.payload.interactionToken!.body.request,
  //             {
  //               derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
  //               encryptionPass: await this.ctx.keyChainLib.getPassword(),
  //             },
  //           ),
  //         ),
  //         rpc: CallType.AsymEncrypt,
  //       },
  //     },
  //     await this.ctx.keyChainLib.getPassword(),
  //     encRequest,
  //   )
  // }

  public async createGenericResponse<T, R>(body: IGenericAttrs<T>) {
    const genericRequest = this.findMessageByType(
      InteractionType.Generic,
    ) as JSONWebToken<Generic<R>>

    const genericResponse = {
      callbackURL: genericRequest.interactionToken.callbackURL,
      body,
    }

    return this.ctx.identityWallet.create.interactionTokens.response.generic(
      genericResponse,
      await this.ctx.keyChainLib.getPassword(),
      genericRequest,
    )
  }

  public async processInteractionToken(token: JSONWebToken<JWTEncodable>) {
    if (!this.participants) {
      this.participants = {
        us: this.ctx.identityWallet.identity,
        them: await this.ctx.registry.resolve(token.signer.did),
      }
    }

    if (token.signer.did !== this.ctx.identityWallet.did) {
      await this.ctx.identityWallet.validateJWT(
        token,
        last(this.getMessages()),
        this.ctx.registry,
      )
    }

    return this.flow
      .handleInteractionToken(token.interactionToken, token.interactionType)
      .then(() => {
        this.interactionMessages.push(token)
      })
  }

  public getSummary(): InteractionSummary {
    return {
      issuer: generateIdentitySummary(this.participants.them),
      state: this.flow.getState(),
    }
  }

  public getAttributesByType = (type: string[]) => {
    return this.ctx.storageLib.get.attributesByType(type)
  }

  public async getStoredCredentialById(id: string) {
    return this.ctx.storageLib.get.verifiableCredential({
      id,
    })
  }

  public getVerifiableCredential = (query?: object) => {
    return this.ctx.storageLib.get.verifiableCredential(query)
  }

  public validateDigestables(signedCredentials: SignedCredential[]) {
    return JolocomLib.util.validateDigestables(
      signedCredentials,
      this.ctx.registry,
    )
  }

  public validateDigestable(signedCredentials: SignedCredential) {
    return JolocomLib.util.validateDigestable(
      signedCredentials,
      this.ctx.registry,
    )
  }
  /**
   * @dev This will crash with a credential receive because it doesn't contain a callbackURL
   * @todo This should probably come from the transport / channel handler
   * @todo Can this use the HttpAgent exported from instead of fetch? http.ts?
   * @todo The return type is difficult to pin down. If we're making a post, we expect a Response obejct,
   *   which either holds a token that can be parsed, or not (i.e. with credential responses, the answer from
   *   the server only holds the status code right now)
   *   If we're linking, the return value is a promise, as per {@see http://reactnative.dev/docs/linking.html#openurl}
   */

  public async send(token: JSONWebToken<JWTEncodable>) {
    // @ts-ignore - CredentialReceive has no callbackURL, needs fix on the lib for JWTEncodable.
    const { callbackURL } = token.interactionToken

    switch (this.channel) {
      case InteractionChannel.HTTP:
        const response = await fetch(callbackURL, {
          method: 'POST',
          body: JSON.stringify({ token: token.encode() }),
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          // TODO Error code for failed send?
          // TODO Actually include some info about the error
          throw new AppError(ErrorCode.Unknown)
        }

        const text = await response.text()

        if (text.length) {
          const { token } = JSON.parse(text)
          return JolocomLib.parse.interactionToken.fromJWT(token)
        }
        break

      case InteractionChannel.Deeplink:
        const callback = `${callbackURL}/${token.encode()}`
        if (!(await Linking.canOpenURL(callback))) {
          throw new AppError(ErrorCode.DeepLinkUrlNotFound)
        }

        return Linking.openURL(callback).then(() => {})
      default:
        throw new AppError(ErrorCode.TransportNotSupported)
    }
  }

  public async storeCredential(toSave: SignedCredentialWithMetadata[]) {
    return Promise.all(
      toSave.map(
        ({ signedCredential }) =>
          signedCredential &&
          this.ctx.storageLib.store.verifiableCredential(signedCredential),
      ),
    )
  }

  public storeCredentialMetadata = (metadata: CredentialMetadataSummary) =>
    this.ctx.storageLib.store.credentialMetadata(metadata)

  public storeIssuerProfile = () =>
    this.ctx.storageLib.store.issuerProfile(
      generateIdentitySummary(this.participants.them),
    )
}
