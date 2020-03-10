import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
} from 'react-navigation'

import { ClaimDetails, Claims, Records } from 'src/ui/home/'
import { DocumentDetails, Documents } from 'src/ui/documents'
import { Landing } from 'src/ui/landing/'
import { PaymentConsent } from 'src/ui/payment'
import { Entropy, RegistrationProgress } from 'src/ui/registration/'
import { Exception } from 'src/ui/generic/'
import { Consent } from 'src/ui/sso'
import { CredentialReceive } from 'src/ui/home'
import { Settings } from 'src/ui/settings'
import { InteractionScreen } from 'src/ui/interaction/container/interactionScreen'
import { AuthenticationConsent } from 'src/ui/authentication'
import { routeList } from './routeList'
import { AppInit } from './ui/generic/appInit'
import strings from './locales/strings'
import { Colors } from 'src/styles'

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

import { NotificationFilter } from './lib/notifications'
import { ErrorScreen } from './ui/errors/containers/errorScreen'

const noHeaderNavOpts = {
  header: null,
}

export const BottomTabBarRoutes = {
  [routeList.Claims]: {
    screen: Claims,
    title: strings.IDENTITY,
    navigationOptions: {
      tabBarIcon: IdentityIcon,
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Documents]: {
    screen: Documents,
    title: strings.DOCUMENTS,
    navigationOptions: {
      tabBarIcon: DocsIcon,
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Records]: {
    screen: Records,
    title: strings.HISTORY,
    navigationOptions: {
      tabBarIcon: HistoryIcon,
      notifications: NotificationFilter.onlyDismissible,
    },
  },
  [routeList.Settings]: {
    screen: Settings,
    title: strings.SETTINGS,
    navigationOptions: {
      tabBarIcon: SettingsIcon,
      notifications: NotificationFilter.onlyDismissible,
    },
  },
}

const BottomTabNavigator = createBottomTabNavigator(BottomTabBarRoutes, {
  tabBarOptions: {
    activeTintColor: Colors.white,
    inactiveTintColor: Colors.gray151,
  },
  tabBarComponent: BottomBar,
})

const RegistrationScreens = createSwitchNavigator(
  {
    [routeList.Landing]: {
      screen: Landing,
      navigationOptions: noHeaderNavOpts,
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

const MainStack = createStackNavigator(
  {
    [routeList.Home]: {
      screen: BottomTabNavigator,
    },
    [routeList.InteractionScreen]: {
      screen: InteractionScreen,
      navigationOptions: {
        notifications: NotificationFilter.onlyDismissible,
        statusBar: false,
      },
    },
    [routeList.CredentialDialog]: {
      screen: CredentialReceive,
      navigationOptions: () => ({
        notifications: NotificationFilter.onlyDismissible,
      }),
    },
    [routeList.Consent]: {
      screen: Consent,
      navigationOptions: () => ({
        notifications: NotificationFilter.onlyDismissible,
      }),
    },
    [routeList.PaymentConsent]: {
      screen: PaymentConsent,
      navigationOptions: () => ({
        notifications: NotificationFilter.onlyDismissible,
      }),
    },
    [routeList.AuthenticationConsent]: {
      screen: AuthenticationConsent,
      navigationOptions: () => ({
        notifications: NotificationFilter.onlyDismissible,
      }),
    },
    [routeList.ClaimDetails]: {
      screen: ClaimDetails,
    },
    [routeList.DocumentDetails]: {
      screen: DocumentDetails,
    },
    [routeList.SeedPhrase]: {
      screen: SeedPhrase,
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },
    [routeList.RepeatSeedPhrase]: {
      screen: RepeatSeedPhrase,
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },

    [routeList.Exception]: {
      screen: Exception,
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },
    [routeList.ErrorReporting]: {
      screen: ErrorReporting,
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },
    [routeList.ErrorScreen]: {
      screen: ErrorScreen,
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },
    ...(__DEV__ && {
      [routeList.Storybook]: {
        screen: require('src/ui/storybook').StorybookScreen,
      },
      [routeList.NotificationScheduler]: {
        screen: NotificationScheduler,
        navigationOptions: {
          notifications: NotificationFilter.all,
        },
      },
    }),
  },
  {
    defaultNavigationOptions: noHeaderNavOpts,
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
        notifications: NotificationFilter.onlyDismissible,
      },
    },
    [routeList.Registration]: {
      screen: RegistrationScreens,
      notifications: NotificationFilter.none,
    },
  },
  {
    initialRouteName: routeList.AppInit,
  },
)

export const RoutesContainer = createAppContainer(Routes)
