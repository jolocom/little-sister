import ErrorCode from '../lib/errorCodes'

export default {
  YOUR_JOLOCOM_WALLET: 'Your Jolocom Wallet',
  ALL_CLAIMS: 'All claims',
  MY_IDENTITY: 'My Identity',
  RECEIVING_NEW_CREDENTIAL: 'Receiving new credential',
  SHARE_CLAIMS: 'Share claims',
  CONFIRM_PAYMENT: 'Confirm payment',
  AUTHORIZATION_REQUEST: 'Authorization request',
  DOCUMENTS: 'Documents',
  LOGIN_RECORDS: 'Login records',
  SETTINGS: 'Settings',
  ENCRYPTING_AND_STORING_DATA_LOCALLY: 'Encrypting and storing data locally',
  FUELING_WITH_ETHER: 'Fueling with ether',
  REGISTERING_DECENTRALIZED_IDENTITY: 'Registering decentralized identity',
  PREPARING_LAUNCH: 'Preparing launch',
  WOULD_YOU_LIKE_TO: 'Would you like to',
  WITH_YOUR_SMARTWALLET: 'with your SmartWallet?',
  AUTHORIZE: 'Authorize',
  DENY: 'Deny',
  GO_BACK: 'Go back',
  YOU_CAN_SCAN_THE_QR_CODE_NOW: 'You can scan the qr code now!',
  CANCEL: 'Cancel',
  ADD_CLAIM: 'Add claim',
  NAME_OF_ISSUER: 'Name of issuer',
  DOCUMENT_DETAILS_CLAIMS: 'Document details/claims',
  COMING_SOON: 'Coming Soon',
  TAKE_BACK_CONTROL_OF_YOUR_DIGITAL_SELF_AND_PROTECT_YOUR_PRIVATE_DATA_AGAINST_UNFAIR_USAGE:
    'Take back control of your digital self and protect your private data against unfair usage',
  ITS_EASY: "It's easy",
  FORGET_ABOUT_LONG_FORMS_AND_REGISTRATIONS:
    'Forget about long forms and registrations',
  INSTANTLY_ACCESS_SERVICES_WITHOUT_USING_YOUR_SOCIAL_MEDIA_PROFILES:
    'Instantly access services without using your social media profiles',
  ENHANCED_PRIVACY: 'Enhanced privacy',
  SHARE_ONLY_THE_INFORMATION_A_SERVICE_REALLY_NEEDS:
    'Share only the information a service really needs',
  PROTECT_YOUR_DIGITAL_SELF_AGAINST_FRAUD:
    'Protect your digital self against fraud',
  GREATER_CONTROL: 'Greater control',
  KEEP_ALL_YOUR_DATA_WITH_YOU_IN_ONE_PLACE_AVAILABLE_AT_ANY_TIME:
    'Keep all your data with you in one place, available at any time',
  TRACK_WHERE_YOU_SIGN_IN_TO_SERVICES: 'Track where you sign in to services',
  GET_STARTED: 'Get started',
  CONFIRM: 'Confirm',
  FOR: 'For',
  OTHER: 'Other',
  TO: 'To',
  FOR_SECURITY_PURPOSES_WE_NEED_SOME_RANDOMNESS:
    'For security purposes, we need some randomness',
  PLEASE_TAP_THE_SCREEN_AND_DRAW_ON_IT_RANDOMLY:
    'Please tap the screen and draw on it randomly',
  CONTINUE: 'Continue',
  WRITE_THESE_WORDS_DOWN_ON_AN_ANALOG_AND_SECURE_PLACE:
    'Write these words down on an analog and secure place',
  WITHOUT_THESE_WORDS_YOU_CANNOT_ACCESS_YOUR_WALLET_AGAIN:
    'Without these words, you cannot access your wallet again',
  YES_I_WROTE_IT_DOWN: 'Yes, I wrote it down',
  GIVE_US_A_FEW_MOMENTS: 'Give us a few moments',
  TO_SET_UP_YOUR_IDENTITY: 'to set up your identity',
  LANGUAGE: 'Language',
  YOUR_PREFERENCES: 'Your preferences',
  VERSION: 'version',
  ADD: 'add',
  NO_LOCAL_CLAIMS: 'No local claims',
  SELF_SIGNED: 'Self-signed',
  THIS_SERVICE_IS_ASKING_YOU_TO_SHARE_THE_FOLLOWING_CLAIMS:
    'This service is asking you to share the following claims',
  YOU_HAVENT_LOGGED_IN_TO_ANY_SERVICES_YET:
    "You haven't logged in to any services yet",
  THERE_WAS_AN_ERROR_WITH_YOUR_REQUEST: 'There was an error with your request',
  COUNTRY: 'Country',
  CITY: 'City',
  POSTAL_CODE: 'Postal Code',
  ADDRESS_LINE1: 'Address Line1',
  ADDRESS_LINE2: 'Address Line2',
  POSTAL_ADDRESS: 'Postal Address',
  CONTACT: 'Contact',
  TELEPHONE: 'Telephone',
  FAMILY_NAME: 'Family Name',
  GIVEN_NAME: 'Given Name',
  MOBILE_PHONE: 'Mobile Phone',
  EMAIL: 'Email',
  NAME: 'Name',
  PERSONAL: 'Personal',
  NO_DOCUMENTS_TO_SEE_HERE: 'No documents to see here',
  EXPIRED: 'expired',

  // Error Title:
  DAMN: 'Damn',
  OH_NO: 'Oh no',
  UH_OH: 'Uh oh',

  // Error Codes:
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

  [ErrorCode.DeepLinkUrlNotFound]: 'Could not find receiving application',
  [ErrorCode.RegistrationFailed]: 'Registration failed',
  [ErrorCode.AppInitFailed]: 'Initialization failed',
}
