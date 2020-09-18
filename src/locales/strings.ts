// NOTE: not importing from 'src/lib/errors' to avoid cycle
// NOTE: absolute path causes `generateTerms` to crash, since it is outside /src (I guess that's the cause)
import { ErrorCode } from '@jolocom/sdk/js/src/lib/errors/types'

const registration = {
  ENCRYPTING_AND_STORING_DATA_LOCALLY: 'Encrypting and storing data locally',
  FUELING_WITH_ETHER: 'Fueling with ether',
  REGISTERING_DECENTRALIZED_IDENTITY: 'Registering decentralized identity',
  PREPARING_LAUNCH: 'Preparing launch',
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
  RECOVER_IDENTITY: 'Recover identity',
  FOR_SECURITY_PURPOSES_WE_NEED_SOME_RANDOMNESS:
    'For security purposes, we need some randomness',
  PLEASE_TAP_THE_SCREEN_AND_DRAW_ON_IT_RANDOMLY:
    'Please tap the screen and draw on it randomly',
  GIVE_US_A_FEW_MOMENTS: 'Give us a few moments',
  TO_SET_UP_YOUR_IDENTITY: 'to set up your identity',
  CREATE_NEW_ACCOUNT: 'create\nnew account',
  RECOVER_YOUR_DIGITAL_IDENTITY: 'recover your\ndigital identity',
  IF_IT_IS_YOUR_FIRST_EXPERIENCE_OF_JOLOCOM_SMARTWALLET:
    'if it is your first experience\nof Jolocom SmartWallet',
}

const settings = {
  SETTINGS: 'Settings',
  YOUR_PREFERENCES: 'Your preferences',
  SECURITY: 'Security',
  ABOUT: 'About',
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  LANGUAGE: 'Language',
  BACKUP_YOUR_IDENTITY: 'Backup your Identity',
  YOUR_IDENTITY_IS_ALREADY_BACKED_UP: 'Your identity is already backed up',
  SET_UP_A_SECURE_PHRASE_TO_RECOVER_YOUR_ACCOUNT_IN_THE_FUTURE_IF_YOUR_PHONE_IS_STOLEN_OR_IS_DAMAGED:
    'Set up a secure phrase to recover your account in the future if your phone is stolen or is damaged',
  DELETE_IDENTITY: 'Delete Identity',
  IF_YOU_HAVE_NOTED_DOWN_YOUR_PHRASE_PUT_THE_SIX_GIVEN_WORDS_ON_THEIR_RIGHT_PLACES:
    'If you have noted down your phrase, put the six given words on their right places',
  SHOW_MY_PHRASE_AGAIN: 'Show my phrase again',
  CONFIRM_AND_CHECK: 'Confirm and check',
  THE_ORDER_WAS_NOT_CORRECT: 'The order was not correct',
  TRY_AGAIN_WITH_ANOTHER_SIX_WORDS_FROM_YOUR_SECURE_PHRASE:
    'Try again with another six words from your secure phrase',
  VERSION: 'version',
  IMPRINT: 'Imprint',
  DE_VERSION: 'DE Version',
  CONTACT_US: 'Contact us',
}

const backup = {
  WRITE_THESE_WORDS_DOWN_ON_AN_ANALOG_AND_SECURE_PLACE:
    'Write these words down on an analog and secure place',
  WITHOUT_THESE_WORDS_YOU_CANNOT_ACCESS_YOUR_WALLET_AGAIN:
    'Without these words, you cannot access your wallet again',
  YES_I_WROTE_IT_DOWN: 'Yes, I wrote it down',
  ACCOUNT_IS_AT_RISK: 'Account is at risk',
  MAKE_IT_SECURE: 'Make it secure',
  FULL_PHRASE_VERIFICATION: 'Full phrase verification',
  RECOVERY: 'Recovery',
  COMPLETED: 'completed',
  TAP_HERE: 'Tap here',
  DONE: 'Done',
  THE_WORD_IS_NOT_CORRECT_CHECK_FOR_TYPOS:
    'The word is not correct, check for typos',
  CHOOSE_THE_RIGHT_WORD_OR_PRESS_ENTER: 'Choose the right word or press enter',
  RESTORE_ACCOUNT: 'Restore account',
  BACK_TO_SIGNUP: 'Back to signup',
  START_WRITING_YOUR_SEED_PHRASE_AND_IT_WILL_APPEAR_HERE_WORD_BY_WORD:
    'Start writing your seed-phrase and it will appear here word by word',
}

const notifications = {
  CONFIRMATION_IS_NOT_COMPLETE: 'Confirmation is not complete',
  YOUR_DATA_MAY_BE_LOST_BECAUSE_YOU_DID_NOT_CONFIRM_THE_SEED_PHRASE_WE_ADVISE_YOU_TO_COMPLETE_THE_REGISTRATION:
    'Your data may be lost because you did not confirm the seed phrase. We advise you to complete the registration.',
  GREAT_SUCCESS: 'Great success!',
  YOU_CAN_FIND_YOUR_NEW_CREDENTIAL_IN_THE_DOCUMENTS:
    'You can find your new credential in the documents',
  OPEN: 'Open',
  DEJA_VU: 'Déjà vu',
  YOU_ALREADY_SAVED_THAT_ONE: 'You already saved that one!',
  AWKWARD: '#awkward',
  THAT_DOC_DOESNT_BELONG_TO_YOU_TRY_SAVING_A_DIFFERENT_ONE:
    'That doc doesn’t belong to you. Try saving a different one.',
  WE_CANT_DO_THIS_SOME_OF_THE_DOCUMENTS_ARE_NOT_YOURS:
    "We can't do this, some of the documents are not yours",
  IT_SEEMS_LIKE_WE_CANT_DO_THIS: "It seems like we can't do this",
  SOMETHING_WENT_WRONG_CHOOSE_AGAIN: 'Something went wrong. Choose again!',
  INTERACTION_WITH_THE_SERVICE_COMPLETED:
    'Interaction with the service completed. Your service page should be updated now',
  ACTION_SUCCEEDED: 'Action succeeded',
  YOUR_DATA_WAS_ENCRYPTED: 'Your data was encrypted',
  YOUR_DATA_WAS_DECRYPTED: 'Your data was decrypted',
}

const errorTitle = {
  DAMN: 'Damn',
  OH_NO: 'Oh no',
  UH_OH: 'Uh oh',
}

const errorReporting = {
  TELL_US_THE_PROBLEM: 'Tell us the problem',
  NO_INTERNET_CONNECTION: 'No internet connection',
  THE_APP_KEEPS_CRASHING: 'The app keeps crashing',
  CANT_LOGIN: "Can't login",
  BACKUP_IS_EMPTY: 'Backup is empty',
  PROBLEMS_WITH_THE_INTERFACE: 'Problems with the interface',
  SOMETHING_DOESNT_SEEM_RIGHT: "Something doesn't seem right",
  OTHER: 'Other',
  SELECT_AN_OPTION: 'Select an option',
  CAN_YOU_BE_MORE_SPECIFIC: 'Can you be more specific?',
  YOU_CAN_PROVIDE_FURTHER_DETAILS_ABOUT_THE_ISSUE_HERE:
    'You can provide further details about the issue here',
  TAP_TO_WRITE: 'Tap to write...',
  WANT_TO_GET_IN_TOUCH: 'Want to get in touch?',
  LEAVE_US_YOUR_EMAIL_AND_NUMBER: 'Leave us your email or number...',
  WE_DO_NOT_STORE_ANY_DATA_AND_DO_NOT_SPAM_ANY_USER_INFORMATION_WILL_BE_DELETED_IMMEDIATELY_AFTER_SOLVING_THE_PROBLEM:
    'We do not store data and do not spam, any user information will be deleted immediately after solving the problem',
  RATE_THE_ISSUE: 'Rate the issue',
  INCLUDE_YOUR_LOGS: 'Include your logs',
  THIS_INCLUDES_SOME_PRIVATE_METADATA_INFO_FILESIZES_BUT_NOT_NAMES_OR_CONTENTS_BUT_IT_WILL_HELP_DEVELOPERS_FIX_BUGS_MORE_QUICKLY:
    'This includes some private metadata info (file sizes, but not names or contents) but it will help developers fix bugs more quickly.',
  SUBMIT_REPORT: 'Submit report',
}

const errorCodes = {
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
  [ErrorCode.TokenExpired]: 'The lifetime of the token has expired',
  [ErrorCode.InvalidSignature]: 'Signature on token is invalid',
  [ErrorCode.WrongDID]: 'You are not the intended audience of received token',
  [ErrorCode.WrongNonce]: 'The token nonce does not match the request',
  [ErrorCode.RegistrationFailed]: 'Registration failed',
  [ErrorCode.AppInitFailed]: 'Initialization failed',
}

const deviceAuth = {
  ENTER_YOUR_PIN: 'Enter your passcode',
  FORGOT_YOUR_PIN: 'Forgot your passcode?',
  I_WILL_USE_PIN_INSTEAD: 'Use PIN instead',
  SKIP: 'Skip',
  YOUR_PIN_WAS_SET_UP: 'Enter your passcode',
  SETTINGS: 'Settings',
  CANCEL: 'Cancel',
  RESET: 'Reset',
  CHANGE_PIN: 'Change passcode',
  CURRENT_PASSCODE: 'Current passcode',
  CREATE_NEW_PASSCODE: 'New passcode',
  WRONG_PIN: 'Wrong code',
  PASSWORD_SUCCESSFULLY_CHANGED: 'Passcode changed!\n',
  CREATE_PASSCODE: 'Create passcode',
  VERIFY_PASSCODE: 'Verify passcode',
  IN_ORDER_TO_PROTECT_YOUR_DATA:
    'Adding an extra layer of security helps prevent unwanted access to your wallet',
  PINS_DONT_MATCH: "PINs don't match",
  ANY_FUTURE_PASSCODE_RESTORE:
    'You can change the passcode later by using your secret phrase',
  HOW_TO_CHANGE_PIN: 'How to change your passcode',
  WE_ARE_SORRY_THAT_YOU_FORGOT:
    'We are very sorry that you forgot your password and may not have access to your wallet, but no worries there is a soluton!',
  RESTORE_ACCESS: 'Restore access',
  STORING_NO_AFFECT_DATA:
    'Setting a new passcode will not affect your stored data',
  YOU_CAN_CHANGE_PIN:
    'You can change your passcode by entering your secret phrase. Click Restore Access below to make the change',
  REPEAT_YOUR_PHRASE: 'Repeat your phrase',
  WORD_BY_WORD: 'word by word',
}

const termsOfService = {
  SMARTWALLET_INTRODUCING_TERMS_AND_CONDITIONS_AND_PRIVACY_POLICY:
    'SmartWallet introducing Terms and Conditions and Privacy Policy',
  YOU_CAN_FIND_THE_GERMAN_AND_ENGLISH_VERSION_OF_THE_DOCUMENTS_BELOW:
    'You can find the German and English version of the documents below. Please note that the German version is legally binding',
  I_UNDERSTAND_AND_ACCEPT_THE_TERMS_OF_SERVICE_AND_PRIVACY_POLICY:
    'I understand and accept the Terms of Service and Privacy Policy',
  ACCEPT_NEW_TERMS: 'Accept new terms',
}

export default {
  ...registration,
  ...settings,
  ...backup,
  ...errorTitle,
  ...errorCodes,
  ...errorReporting,
  ...notifications,
  ...deviceAuth,
  ...termsOfService,
  IDENTITY: 'Identity',
  DOCUMENTS: 'Documents',
  HISTORY: 'History',
  YOUR_JOLOCOM_WALLET: 'Your Jolocom Wallet',
  ALL_CLAIMS: 'All claims',
  RECEIVING_NEW_CREDENTIAL: 'Receiving new credential',
  CHOOSE_ONE_OR_MORE_DOCUMENTS_PROVIDED_BY_THIS_SERVICE_AND_WE_WILL_GENERATE_THEM_FOR_YOU:
    'Choose one or more documents provided by this service and we will generate them for you',
  RECEIVE: 'Receive',
  SHARE_CLAIMS: 'Share claims',
  CONFIRM_PAYMENT: 'Confirm payment',
  AUTHORIZATION_REQUEST: 'Authorization request',
  ESTABLISH_CHANNEL_REQUEST: 'Establish Channel request',
  WOULD_YOU_LIKE_TO: 'Would you like to',
  WITH_YOUR_SMARTWALLET: 'with your SmartWallet?',
  AUTHORIZE: 'Authorize',
  DENY: 'Deny',
  GO_BACK: 'Go back',
  ITS_ALL_AUTOMATIC_JUST_PLACE_YOUR_PHONE_ABOVE_THE_CODE:
    "It's all automatic, just place your phone above the code",
  SCAN: 'Scan',
  SCAN_QR: 'Scan QR',
  ENABLE_ACCESS_SO_YOU_CAN_START_TAKING_PHOTOS_AND_VIDEOS:
    'Enable access so you can start taking photos and videos',
  ENABLE_CAMERA_ACCESS: 'Enable Camera Access',
  LOOKS_LIKE_WE_CANT_PROVIDE_THIS_SERVICE:
    "Looks like we can't provide this service",
  IS_THIS_THE_RIGHT_QR_CODE_TRY_AGAIN: 'Is this the right QR code? Try again.',
  REQUEST_PERMISSION: 'Request permission',
  SEND_ERROR_REPORT: 'Send error report',
  ERROR_REPORT_SENT: 'Error report sent',
  YOU_CAN_SCAN_THE_QR_CODE_NOW: 'You can scan the qr code now!',
  CANCEL: 'Cancel',
  ADD_CLAIM: 'Add claim',
  NAME_OF_ISSUER: 'Name of issuer',
  DOCUMENT_DETAILS_CLAIMS: 'Document details/claims',
  COMING_SOON: 'Coming Soon',
  CONFIRM: 'Confirm',
  FOR: 'For',
  OTHER: 'Other',
  TO: 'To',
  CONTINUE: 'Continue',
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
  UNKNOWN: 'Unknown',

  //ESATABLISH
  CONNECTION_DESCRIPTION: 'Connection description:',
}
