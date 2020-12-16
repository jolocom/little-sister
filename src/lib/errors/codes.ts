import { ErrorCode as SDKErrorCode } from '@jolocom/sdk'
export { SDKErrorCode }

export enum ErrorCode {
    Unknown = "Unknown",
    WalletInitFailed = "WalletInit",

    SaveClaimFailed = "SaveClaim",
    SaveExternalCredentialFailed = "SaveExtCred",
    SaveCredentialMetadataFailed = "SaveCredMetadata",

    DeepLinkUrlNotFound = "DeepLinkUrlNotFound",

    TokenExpired = "TokenExpired",
    InvalidSignature = "InvalidSignature",

    WrongDID = "WrongDID",
    WrongNonce = "WrongNonce",
    WrongFlow = "WrongFlow",

    AuthenticationRequestFailed = "AuthRequest",
    AuthenticationResponseFailed = "AuthResponse",

    CredentialOfferFailed = "CredOffer",
    CredentialsReceiveFailed = "CredsReceive",
    CredentialRequestFailed = "CredRequest",
    CredentialResponseFailed = "CredResponse",

    ParseJWTFailed = "ParseJWT",

    RegistrationFailed = "Registration",

    AppInitFailed = "AppInitFailed"
}
