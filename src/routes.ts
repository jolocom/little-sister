import { Image, Platform, StyleProp, TextStyle } from 'react-native'
import { createElement } from 'react'

import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  NavigationRoute,
  NavigationScreenOptions,
  NavigationScreenProp,
  StackViewTransitionConfigs,
} from 'react-navigation'
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch'

import { ClaimDetails, Claims, Records } from 'src/ui/home/'
import { DocumentDetails, Documents } from 'src/ui/documents'
import { Landing } from 'src/ui/landing/'
import { PaymentConsent } from 'src/ui/payment'
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
  header: null,
}

const headerTitleStyle: StyleProp<TextStyle> = {
  ...Typography.standardText,
  // the default is 500, which is not supported on Android properly
  fontWeight: 'normal',
  color: Colors.navHeaderTintDefault,
}

const commonNavigationOptions: NavigationScreenOptions = {
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
      headerBackImage,
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
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Documents]: {
    screen: Documents,
    title: strings.DOCUMENTS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: DocsIcon,
      notifications: NotificationFilter.all,
    },
  },
  [routeList.Records]: {
    screen: Records,
    title: strings.HISTORY,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: HistoryIcon,
      notifications: NotificationFilter.onlyDismissible,
    },
  },
  [routeList.Settings]: {
    screen: Settings,
    title: strings.SETTINGS,
    navigationOptions: {
      ...commonNavigationOptions,
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
        ...noHeaderNavOpts,
        notifications: NotificationFilter.onlyDismissible,
        statusBar: false,
      },
    },

    [routeList.CredentialDialog]: {
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
    [routeList.PaymentConsent]: {
      screen: PaymentConsent,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.CONFIRM_PAYMENT),
      }),
    },
    [routeList.AuthenticationConsent]: {
      screen: AuthenticationConsent,
      navigationOptions: () => ({
        ...navOptScreenWCancel,
        headerTitle: I18n.t(strings.AUTHORIZATION_REQUEST),
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
        ...noHeaderNavOpts,
        notifications: NotificationFilter.none,
      },
    },
    [routeList.RepeatSeedPhrase]: {
      screen: RepeatSeedPhrase,
      navigationOptions: {
        ...noHeaderNavOpts,
        notifications: NotificationFilter.none,
      },
    },

    [routeList.Exception]: {
      screen: Exception,
      navigationOptions: {
        ...noHeaderNavOpts,
        notifications: NotificationFilter.none,
      },
    },
    [routeList.ErrorReporting]: {
      screen: ErrorReporting,
      navigationOptions: {
        ...noHeaderNavOpts,
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
          ...noHeaderNavOpts,
          notifications: NotificationFilter.all,
        },
      },
    }),
  },
  {
    transitionConfig: (transitionProps, prevTransitionProps) => {
      const isModal = MODAL_ROUTES.some(
        screenName =>
          screenName === transitionProps.scene.route.routeName ||
          (prevTransitionProps &&
            screenName === prevTransitionProps.scene.route.routeName),
      )
      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal,
      )
    },
    defaultNavigationOptions: noHeaderNavOpts,
  },
)

const MODAL_ROUTES = [routeList.InteractionScreen]

// NOTE: navigatorReset in actions/navigation assumes that there is only 1
// StackRouter child at the top level
export const Routes = createAnimatedSwitchNavigator(
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
