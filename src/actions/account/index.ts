import { navigationActions } from 'src/actions/'
import { routeList } from 'src/routeList'
import { CategorizedClaims, DecoratedClaims } from 'src/reducers/account'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import {
  getClaimMetadataByCredentialType,
  getCredentialUiCategory,
  getUiCredentialTypeByType,
} from '../../lib/util'
import { cancelReceiving } from '../sso'
import { JolocomLib } from 'jolocom-lib'
import { ThunkAction } from 'src/store'
import { groupBy, map, mergeRight, omit, uniq, zipWith } from 'ramda'
import { compose } from 'redux'
import { CredentialMetadataSummary } from '../../lib/storage/storage'
import { IdentitySummary } from '../sso/types'
import { KeyTypes } from 'jolocom-lib/js/vaultedKeyProvider/types'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { Identity } from 'jolocom-lib/js/identity/identity'

export const setDid = (did: string) => ({
  type: 'DID_SET',
  value: did,
})

export const setSelected = (claim: DecoratedClaims) => ({
  type: 'SET_SELECTED',
  selected: claim,
})

export const resetSelected = () => ({
  type: 'RESET_SELECTED',
})

export const handleClaimInput = (fieldValue: string, fieldName: string) => ({
  type: 'HANDLE_CLAIM_INPUT',
  fieldName,
  fieldValue,
})

export const checkIdentityExists: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { keyChainLib, storageLib, encryptionLib, registry } = backendMiddleware
  const encryptedEntropy = await storageLib.get.encryptedSeed()

  if (!encryptedEntropy) {
    const isRegistering = getState().registration.loading.isRegistering

    const routeName = isRegistering
      ? routeList.RegistrationProgress
      : routeList.Landing

    return dispatch(navigationActions.navigate({ routeName }))
  }

  const encryptionPass = await keyChainLib.getPassword()

  const decryptedSeed = encryptionLib.decryptWithPass({
    cipher: encryptedEntropy,
    pass: encryptionPass,
  })

  if (!decryptedSeed) {
    throw new Error('could not decrypt seed')
  }

  // TODO: rework the seed param on lib, currently cleartext seed is being passed around. Bad.
  const userVault = JolocomLib.KeyProvider.fromSeed(
    Buffer.from(decryptedSeed, 'hex'),
    encryptionPass,
  )

  const userPubKey = userVault.getPublicKey({
    derivationPath: KeyTypes.jolocomIdentityKey,
    encryptionPass,
  })

  const didDocument = await storageLib.get.didDoc(publicKeyToDID(userPubKey))

  if (didDocument) {
    const identity = Identity.fromDidDocument({ didDocument })

    // TODO Simplify constructor
    backendMiddleware.identityWallet = new IdentityWallet({
      identity,
      vaultedKeyProvider: userVault,
      publicKeyMetadata: {
        derivationPath: KeyTypes.jolocomIdentityKey,
        keyId: identity.publicKeySection[0].id,
      },
      contractsAdapter: registry.contractsAdapter,
      contractsGateway: registry.contractsGateway,
    })
  } else {
    const { jolocomIdentityKey: derivationPath } = JolocomLib.KeyTypes
    const identityWallet = await registry.authenticate(userVault, {
      encryptionPass,
      derivationPath,
    })

    backendMiddleware.identityWallet = identityWallet
    await storageLib.store.didDoc(identityWallet.didDocument)
  }

  const userDid = backendMiddleware.identityWallet.identity.did
  dispatch(setDid(userDid))

  return dispatch(navigationActions.navigate({ routeName: routeList.Home }))
}

export const openClaimDetails = (
  claim: DecoratedClaims,
): ThunkAction => dispatch => {
  dispatch(setSelected(claim))
  return dispatch(
    navigationActions.navigate({
      routeName: routeList.ClaimDetails,
    }),
  )
}

export const saveClaim: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { identityWallet, storageLib, keyChainLib } = backendMiddleware

  const did = getState().account.did.did
  const claimsItem = getState().account.claims.selected
  const password = await keyChainLib.getPassword()

  const verifiableCredential = await identityWallet.create.signedCredential(
    {
      metadata: getClaimMetadataByCredentialType(claimsItem.credentialType),
      // the library acts directly on the object passed in, so a copy should be made first
      claim: { ...claimsItem.claimData },
      subject: did,
    },
    password,
  )

  if (claimsItem.id) {
    await storageLib.delete.verifiableCredential(claimsItem.id)
  }

  await storageLib.store.verifiableCredential(verifiableCredential)

  await dispatch(setClaimsForDid)

  return dispatch(navigationActions.navigatorResetHome())
}

// TODO Currently only rendering  / adding one
export const saveExternalCredentials: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { storageLib } = backendMiddleware
  const externalCredentials = getState().account.claims.pendingExternal

  if (!externalCredentials.offer.length) {
    return dispatch(cancelReceiving)
  }

  const cred: SignedCredential = externalCredentials.offer[0].credential

  await storageLib.delete.verifiableCredential(cred.id)
  await storageLib.store.verifiableCredential(cred)

  return dispatch(cancelReceiving)
}

export const toggleLoading = (value: boolean) => ({
  type: 'SET_LOADING',
  value,
})

export const setClaimsForDid: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware,
) => {
  const { storageLib } = backendMiddleware

  const verifiableCredentials: SignedCredential[] = await storageLib.get.verifiableCredential()

  const metadata = await Promise.all(
    verifiableCredentials.map(el => storageLib.get.credentialMetadata(el)),
  )

  const issuers = uniq(verifiableCredentials.map(cred => cred.issuer))

  const issuerMetadata = await Promise.all(
    issuers.map(storageLib.get.publicProfile),
  )

  const claims = prepareClaimsForState(
    verifiableCredentials,
    metadata,
    issuerMetadata,
  ) as CategorizedClaims

  return dispatch({
    type: 'SET_CLAIMS_FOR_DID',
    claims,
  })
}

export const prepareClaimsForState = (
  credentials: SignedCredential[],
  credentialMetadata: Array<CredentialMetadataSummary | {}>,
  issuerMetadata: Array<IdentitySummary | { did: string }>,
) =>
  compose(
    groupBy(getCredentialUiCategory),
    zipWith(mergeRight, credentialMetadata),
    map(addIssuerInfo(issuerMetadata)),
    map(convertToDecoratedClaim),
  )(credentials)

export const addIssuerInfo = (
  issuerProfiles: Array<{ did: string } | IdentitySummary> | [],
) => (claim: DecoratedClaims) => {
  if (!issuerProfiles || !issuerProfiles.length) {
    return claim
  }

  const issuer = issuerProfiles.find(el => el.did === claim.issuer.did)

  return issuer
    ? {
        ...claim,
        issuer,
      }
    : claim
}

/** @TODO Util, make subject mandatory (in lib) */
export const convertToDecoratedClaim = ({
  claim,
  type,
  issuer,
  id,
  expires,
}: SignedCredential): DecoratedClaims => ({
  credentialType: getUiCredentialTypeByType(type),
  issuer: {
    did: issuer,
  },
  claimData: omit(['id'], claim),
  id,
  subject: claim.id || 'Not found',
  expires: expires || undefined,
})
