// NOTE: don't use 'const' so that values are useable in both .js and .ts files
export enum routeList {
  AppInit = 'AppInit',
  Main = 'Main',
  Lock = "Lock",

  // Registration
  Registration = 'Registration',
  Landing = 'Landing',
  Entropy = 'Entropy',
  RegistrationProgress = 'RegistrationProgress',
  Loading = 'Loading',

  // Recovery
  InputSeedPhrase = 'InputSeedPhrase',

  // Pin Recovery
  HowToChangePIN = "HowToChangePIN",
  InputSeedPhrasePin = 'InputSeedPhrasePin',
  ChangePIN = 'ChangePIN',

  // Bottom Nav Screens
  Home = 'Home',
  Claims = 'Claims',
  Documents = 'Documents',
  Records = 'Records',
  Settings = 'Settings',
  InteractionScreen = 'InteractionScreen',

  // Interactions & Details
  CredentialReceive = 'CredentialReceive',
  CredentialReceiveNegotiate = 'CredentialReceiveNegotiate',
  Consent = 'Consent',
  EstablishChannelConsent = 'EstablishChannelConsent',
  PaymentConsent = 'PaymentConsent',
  AuthenticationConsent = 'AuthenticationConsent',
  ClaimDetails = 'ClaimDetails',
  DocumentDetails = 'DocumentDetails',

  // Settings
  RepeatSeedPhrase = 'RepeatSeedPhrase',
  SeedPhrase = 'SeedPhrase',
  RegisterPIN = 'RegisterPIN',
  TermsOfService = 'TermsOfService',
  PrivacyPolicy = 'PrivacyPolicy',
  Impressum = 'Impressum',

  // General
  Exception = 'Exception',
  ErrorReporting = 'ErrorReporting',

  // Dev only
  Storybook = 'Storybook',
  NotificationScheduler = 'NotificationScheduler',

  // SW2.0
  TermsOfServiceConsent = 'TermsOfServiceConsent',
}
