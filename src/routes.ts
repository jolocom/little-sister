import { Image, Platform, StyleProp, TextStyle } from 'react-native'
import { createElement } from 'react'

import {
  createAppContainer,
  NavigationRoute,
  NavigationScreenProp,
  createSwitchNavigator,
} from 'react-navigation'

import { createStackNavigator, TransitionPresets } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch'

import { ClaimDetails, Claims, Records } from 'src/ui/home/'
import { DocumentDetails, Documents } from 'src/ui/documents'
import { Landing } from 'src/ui/landing/'
import { Entropy, RegistrationProgress } from 'src/ui/registration/'
import { Exception } from 'src/ui/generic/'
import { Consent } from 'src/ui/sso'
import { CredentialReceive } from 'src/ui/home'
import { Settings } from 'src/ui/settings'
import I18n from 'src/locales/i18n'
import { InteractionScreen } from 'src/ui/interaction/container/interactionScreen'
import { AuthenticationConsent } from 'src/ui/authentication'
import { routeList } from './routeList'
import { AppInit } from './ui/generic/appInit'
import strings from './locales/strings'
import { Colors, Typography } from 'src/styles'
import ChangePIN from './ui/deviceauth/ChangePIN'

import Lock from './ui/deviceauth/Lock'
import RegisterPIN from './ui/deviceauth/RegisterPIN'
import HowToChangePIN from './ui/deviceauth/HowToChangePIN'

import {
  DocsIcon,
  HistoryIcon,
  IdentityIcon,
  SettingsIcon,
} from 'src/resources'
import { RepeatSeedPhrase } from './ui/recovery/container/repeatSeedPhrase'
import { SeedPhrase } from './ui/recovery/container/seedPhrase'
import { InputSeedPhrase } from './ui/recovery/container/inputSeedPhrase'
import { ErrorReporting } from './ui/errors/containers/errorReporting'
import { BottomBar } from './ui/navigation/container/bottomBar'
import { NotificationScheduler } from './ui/notifications/containers/devNotificationScheduler'
import {
  TermsOfServiceConsent,
  TermsOfService,
  PrivacyPolicy,
  Impressum,
} from './ui/termsAndPrivacy'
import { NotificationFilter } from './lib/notifications'
import { CredentialReceiveNegotiate } from './ui/sso/containers/credentialReceiveNegotiate'
import { EstablishChannelConsent } from './ui/establishChannel'

// only used on android
const headerBackImage = createElement(Image, {
  source: require('./resources/img/close.png'),
  style: {
    height: 26,
    width: 26,
    padding: 4,
  },
})

const noHeaderNavOpts = {
  headerShown: false,
}

const headerTitleStyle: StyleProp<TextStyle> = {
  ...Typography.standardText,
  // the default is 500, which is not supported on Android properly
  fontWeight: 'normal',
  color: Colors.navHeaderTintDefault,
}

const commonNavigationOptions = {
  headerTitleStyle,
  headerStyle: {
    backgroundColor: Colors.navHeaderBgDefault,
    borderBottomWidth: 0,
  },
}

const navOptScreenWCancel = {
  ...commonNavigationOptions,
  ...Platform.select({
    android: {
      headerBackImage: () => headerBackImage,
    },
    ios: {
      headerTintColor: Colors.purpleMain,
    },
  }),
}

export const BottomTabBarRoutes = {
  [routeList.Claims]: {
    screen: Claims,
    title: strings.IDENTITY,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: IdentityIcon,
      // @ts-ignore
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Documents]: {
    screen: Documents,
    title: strings.DOCUMENTS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: DocsIcon,
      // @ts-ignore
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Records]: {
    screen: Records,
    title: strings.HISTORY,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: HistoryIcon,
      // @ts-ignore
      notifications: NotificationFilter.onlyDismissible,
    },
  },
  [routeList.Settings]: {
    screen: Settings,
    title: strings.SETTINGS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: SettingsIcon,
      // @ts-ignore
      notifications: NotificationFilter.onlyDismissible,
    },
  },
}

const BottomTabNavigator = createBottomTabNavigator(BottomTabBarRoutes, {
  tabBarOptions: {
    activeTintColor: Colors.white,
    inactiveTintColor: Colors.gray151,
  },
  navigationOptions: ({
    navigation,
  }: {
    navigation: NavigationScreenProp<NavigationRoute>
  }) => {
    // proxy the route title as the headerTitle for this screen
    const nestedRouteName =
      navigation.state.routes[navigation.state.index].routeName
    return {
      headerTitle: I18n.t(BottomTabBarRoutes[nestedRouteName].title),
    }
  },
  tabBarComponent: BottomBar,
})

const RegistrationScreens = createAnimatedSwitchNavigator(
  {
    [routeList.Landing]: {
      screen: Landing,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.TermsOfServiceConsent]: {
      screen: TermsOfServiceConsent,
      navigationOptions: {
        ...noHeaderNavOpts,
        notifications: NotificationFilter.none,
      },
    },
    [routeList.InputSeedPhrase]: {
      screen: InputSeedPhrase,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.Entropy]: {
      screen: Entropy,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.RegistrationProgress]: {
      screen: RegistrationProgress,
      navigationOptions: noHeaderNavOpts,
    },
  },
  {
    initialRouteName: routeList.Landing,
  },
)

const lockTransition = TransitionPresets.ModalSlideFromBottomIOS

const MainStack = createStackNavigator(
  {
    [routeList.Home]: {
      screen: BottomTabNavigator,
    },

    // The following two screens "lock" the app, and should not show
    // notifications or allow using the "navigate back" gesture
    [routeList.Lock]: {
      screen: Lock,
      navigationOptions: {
        gestureEnabled: false,
        // @ts-ignore
        notifications: NotificationFilter.none,
        ...lockTransition
      },
    },
    [routeList.RegisterPIN]: {
      screen: RegisterPIN,
      navigationOptions: {
        gestureEnabled: false,
        // @ts-ignore
        notifications: NotificationFilter.none,
        ...lockTransition
      },
    },

    [routeList.HowToChangePIN]: {
      screen: HowToChangePIN,
    },
    [routeList.ChangePIN]: {
      screen: ChangePIN,
    },
    [routeList.InputSeedPhrasePin]: {
      screen: InputSeedPhrase,
      // @ts-ignore
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.InteractionScreen]: {
      screen: InteractionScreen,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.onlyDismissible,
        ...TransitionPresets.ScaleFromCenterAndroid,
      },
    },
    [routeList.CredentialReceiveNegotiate]: {
      screen: CredentialReceiveNegotiate,
    },

    [routeList.CredentialReceive]: {
      screen: CredentialReceive,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.RECEIVING_NEW_CREDENTIAL),
      }),
    },
    [routeList.Consent]: {
      screen: Consent,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.SHARE_CLAIMS),
      }),
    },
    [routeList.AuthenticationConsent]: {
      screen: AuthenticationConsent,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.AUTHORIZATION_REQUEST),
      }),
    },
    [routeList.EstablishChannelConsent]: {
      screen: EstablishChannelConsent,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.ESTABLISH_CHANNEL_REQUEST),
      }),
    },
    [routeList.ClaimDetails]: {
      screen: ClaimDetails,
      navigationOptions: navOptScreenWCancel,
    },
    [routeList.DocumentDetails]: {
      screen: DocumentDetails,
      navigationOptions: {
        ...navOptScreenWCancel,
      },
    },
    [routeList.SeedPhrase]: {
      screen: SeedPhrase,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.none,
      },
    },
    [routeList.RepeatSeedPhrase]: {
      screen: RepeatSeedPhrase,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.none,
      },
    },
    [routeList.TermsOfService]: {
      screen: TermsOfService,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.onlyDismissible,
      },
    },
    [routeList.PrivacyPolicy]: {
      screen: PrivacyPolicy,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.onlyDismissible,
      },
    },
    [routeList.Impressum]: {
      screen: Impressum,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.onlyDismissible,
      },
    },
    [routeList.Exception]: {
      screen: Exception,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.none,
      },
    },
    [routeList.ErrorReporting]: {
      screen: ErrorReporting,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.none,
      },
    },
    ...(__DEV__ && {
      [routeList.Storybook]: {
        screen: require('src/ui/storybook').StorybookScreen,
        navigationOptions: navOptScreenWCancel,
      },
      [routeList.NotificationScheduler]: {
        screen: NotificationScheduler,
        navigationOptions: {
          // @ts-ignore
          notifications: NotificationFilter.all,
        },
      },
    }),
  },
  {
    defaultNavigationOptions: {
      ...noHeaderNavOpts,
    },
  },
)

// NOTE: navigatorReset in actions/navigation assumes that there is only 1
// StackRouter child at the top level
export const Routes = createSwitchNavigator(
  {
    [routeList.AppInit]: {
      screen: AppInit,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.Main]: {
      screen: MainStack,
      navigationOptions: {
        // @ts-ignore
        notifications: NotificationFilter.onlyDismissible,
      },
    },
    [routeList.Registration]: {
      screen: RegistrationScreens,
      // @ts-ignore
      notifications: NotificationFilter.none,
    },
  },
  {
    initialRouteName: routeList.AppInit,
  },
)

export const RoutesContainer = createAppContainer(Routes)
