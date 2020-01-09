import { Image, Platform, StyleProp, TextStyle } from 'react-native'
import { createElement } from 'react'

import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator,
  NavigationRoute,
  NavigationScreenOptions,
  NavigationScreenProp,
  StackActions,
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
import I18n from 'src/locales/i18n'
import { InteractionScreen } from 'src/ui/interaction/container/interactionScreen'
import { AuthenticationConsent } from 'src/ui/authentication'
import { routeList } from './routeList'
import { AppInit } from './ui/generic/appInit'
import BottomTabBar from 'src/ui/generic/bottomTabBar'
import strings from './locales/strings'
import { Colors, Typography } from 'src/styles'

import { store as ReduxStore } from './App'

import {
  DocumentsMenuIcon,
  IdentityMenuIcon,
  RecordsMenuIcon,
  SettingsMenuIcon,
} from 'src/resources'
import { RepeatSeedPhrase } from './ui/recovery/container/repeatSeedPhrase'
import { SeedPhrase } from './ui/recovery/container/seedPhrase'
import { InputSeedPhrase } from './ui/recovery/container/inputSeedPhrase'
import { ErrorReporting } from './ui/errors/containers/errorReporting'
import { NotificationScheduler } from './ui/notifications/containers/devNotificationScheduler'

import { NotificationFilter } from './lib/notifications'
import { navigate } from './actions/navigation'
import { ThunkDispatch } from './store'
import { setActiveNotificationFilter } from './actions/notifications'

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

const tabNavigationHandler = (filter: NotificationFilter) => ({
  navigation,
}: any) => {
  const route = navigation.state
  const isNestedRoute = route.hasOwnProperty('index') && route.index > 0
  const thunkDispatch = ReduxStore.dispatch as ThunkDispatch

  if (navigation.isFocused()) {
    if (isNestedRoute) {
      navigation.dispatch(StackActions.popToTop({ key: route.key }))
    } else {
      navigation.emit('refocus')
    }
    thunkDispatch(setActiveNotificationFilter(filter))
  } else {
    thunkDispatch(navigate({ routeName: navigation.state.routeName }))
  }
}

export const BottomTabBarRoutes = {
  [routeList.Claims]: {
    screen: Claims,
    title: strings.MY_IDENTITY,
    navigationOptions: {
      ...commonNavigationOptions,
      notifications: NotificationFilter.all,
      tabBarIcon: IdentityMenuIcon,
      tabBarOnPress: tabNavigationHandler(NotificationFilter.all),
    },
  },
  [routeList.Documents]: {
    screen: Documents,
    title: strings.DOCUMENTS,
    navigationOptions: {
      ...commonNavigationOptions,
      notifications: NotificationFilter.all,
      tabBarOnPress: tabNavigationHandler(NotificationFilter.all),
      tabBarIcon: (props: {
        tintColor: string
        focused: boolean
        fillColor?: string
      }) => {
        props.fillColor = Colors.bottomTabBarBg
        return new DocumentsMenuIcon(props)
      },
    },
  },
  [routeList.Records]: {
    screen: Records,
    title: strings.LOGIN_RECORDS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: RecordsMenuIcon,
      notifications: NotificationFilter.onlyDismissible,
      tabBarOnPress: tabNavigationHandler(NotificationFilter.onlyDismissible),
    },
  },
  [routeList.Settings]: {
    screen: Settings,
    title: strings.SETTINGS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: SettingsMenuIcon,
      notifications: NotificationFilter.onlyDismissible,
      tabBarOnPress: tabNavigationHandler(NotificationFilter.onlyDismissible),
    },
  },
}

const BottomTabNavigator = createBottomTabNavigator(BottomTabBarRoutes, {
  tabBarOptions: {
    ...Platform.select({
      android: {
        activeTintColor: Colors.purpleMain,
        inactiveTintColor: Colors.greyLighter,
      },
      ios: {
        activeTintColor: Colors.white,
        inactiveTintColor: Colors.white050,
      },
    }),
    showLabel: false,
    style: {
      height: 50,
      bottom: 0,
      backgroundColor: Colors.bottomTabBarBg,
    },
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
  tabBarComponent: BottomTabBar,
  //tabBarPosition: 'bottom',
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
      navigationOptions: noHeaderNavOpts,
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
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.RepeatSeedPhrase]: {
      screen: RepeatSeedPhrase,
      navigationOptions: noHeaderNavOpts,
    },

    [routeList.Exception]: {
      screen: Exception,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.ErrorReporting]: {
      screen: ErrorReporting,
      navigationOptions: noHeaderNavOpts,
    },
    ...(__DEV__ && {
      [routeList.Storybook]: {
        screen: require('src/ui/storybook').StorybookScreen,
        navigationOptions: navOptScreenWCancel,
      },
      [routeList.NotificationScheduler]: {
        screen: NotificationScheduler,
        navigationOptions: {
          notifications: NotificationFilter.all,
          ...noHeaderNavOpts,
        },
      },
    }),
  },
  {
    defaultNavigationOptions: commonNavigationOptions,
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
      navigationOptions: {
        notifications: NotificationFilter.none,
      },
    },
  },
  {
    initialRouteName: routeList.AppInit,
  },
)

// TODO: updating the filter state when navigating back
/*
const {
  getStateForAction: getStateForActionScreensStack,
} = Routes.router

Routes.router = {
  ...Routes.router,
  getStateForAction(action, state) {
    if (action.type == 'Navigation/BACK') {
      const newState = getStateForActionScreensStack(action)
      console.log(newState)
    }
    return getStateForActionScreensStack(action, state)
  },
}
*/

export const RoutesContainer = createAppContainer(Routes)
