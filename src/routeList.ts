// NOTE: don't use 'const' so that values are useable in both .js and .ts files
export enum routeList {
  AppInit = 'AppInit',
  Main = 'Main',

  // Registration
  Registration = 'Registration',
  Landing = 'Landing',
  Entropy = 'Entropy',
  RegistrationProgress = 'RegistrationProgress',
  Loading = 'Loading',

  // Recovery
  InputSeedPhrase = 'InputSeedPhrase',

  // Bottom Nav Screens
  Home = 'Home',
  Claims = 'Claims',
  Documents = 'Documents',
  Records = 'Records',
  Settings = 'Settings',
  InteractionScreen = 'InteractionScreen',

  // Interactions & Details
  CredentialDialog = 'CredentialDialog',
  Consent = 'Consent',
  PaymentConsent = 'PaymentConsent',
  AuthenticationConsent = 'AuthenticationConsent',
  ClaimDetails = 'ClaimDetails',
  DocumentDetails = 'DocumentDetails',

  // Settings
  RepeatSeedPhrase = 'RepeatSeedPhrase',
  SeedPhrase = 'SeedPhrase',

  // General
  Exception = 'Exception',
  ErrorReporting = 'ErrorReporting',
  ErrorScreen = 'ErrorScreen',

  // Dev only
  Storybook = 'Storybook',
  NotificationScheduler = 'NotificationScheduler',
}
