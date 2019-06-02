import {routeList} from '../routeList'

export const enum ErrorCode {
  Unknown = 'Unknown',

  // actions/account/index
  WalletInitFailed = 'WalletInit',
  SaveClaimFailed = 'SaveClaim',
  SaveExternalCredentialFailed = 'SaveExtCred',

  // actions/sso/authenticationRequest
  AuthenticationRequestFailed = 'AuthRequest',
  AuthenticationResponseFailed = 'AuthResponse',

  // actions/sso/paymentRequest
  PaymentRequestFailed = 'PayRequest',
  PaymentResponseFailed = 'PayResponse',

  // actions/sso/index
  CredentialOfferFailed = 'CredOffer',
  CredentialsReceiveFailed = 'CredsReceive',
  CredentialRequestFailed = 'CredRequest',
  CredentialResponseFailed = 'CredResponse',
  ParseJWTFailed = 'ParseJWT',

  // actions/registration
  RegistrationFailed = 'Registration',
}

// NOTE: these strings are localized, remember to update locale files
const errorMessages: { [key in ErrorCode]: string } = {
  [ErrorCode.Unknown]: 'Unknown Error',

  [ErrorCode.WalletInitFailed]: 'Unable to initialize wallet',
  [ErrorCode.SaveClaimFailed]: 'Could not save claim',
  [ErrorCode.SaveExternalCredentialFailed]:
    'Could not save external credential',

  [ErrorCode.AuthenticationRequestFailed]: 'Authentication request failed',
  [ErrorCode.AuthenticationResponseFailed]: 'Authentication response failed',
  [ErrorCode.PaymentRequestFailed]: 'Payment request failed',
  [ErrorCode.PaymentResponseFailed]: 'Payment response failed',

  [ErrorCode.CredentialOfferFailed]: 'Credential offer failed',
  [ErrorCode.CredentialsReceiveFailed]: 'Could not receive credentials',
  [ErrorCode.CredentialRequestFailed]: 'Credential request failed',
  [ErrorCode.CredentialResponseFailed]: 'Credential response failed',
  [ErrorCode.ParseJWTFailed]: 'Could not parse JSONWebToken',

  [ErrorCode.RegistrationFailed]: 'Registration failed',
}

export class AppError extends Error {
  code: ErrorCode
  origError: any
  navigateTo: routeList

  constructor(code = ErrorCode.Unknown, origError?: any, navigateTo: routeList = routeList.Home) {
    super(errorMessages[code] || errorMessages[ErrorCode.Unknown])
    this.code = code
    this.origError = origError
    this.navigateTo = navigateTo
  }
}

export const errorTitleMessages = ['Damn.', 'Oh no.', 'Uh oh.']
