import { Platform, Image, StyleProp, TextStyle } from 'react-native'
import { createElement } from 'react'

import {
  createStackNavigator,
  createBottomTabNavigator,
  NavigationScreenOptions,
  NavigationRoute,
  NavigationScreenProp,
  createAppContainer,
  createSwitchNavigator,
} from 'react-navigation'

import { Claims, Records, ClaimDetails } from 'src/ui/home/'
import { Documents, DocumentDetails } from 'src/ui/documents'
import { Landing } from 'src/ui/landing/'
import { PaymentConsent } from 'src/ui/payment'
import { SeedPhrase, RegistrationProgress, Entropy } from 'src/ui/registration/'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Exception /*BottomNavBar*/ } from 'src/ui/generic/'
import { Consent } from 'src/ui/sso'
import { CredentialReceive } from 'src/ui/home'
import { Settings } from 'src/ui/settings'
import I18n from 'src/locales/i18n'
import { QRScannerContainer } from 'src/ui/generic/qrcodeScanner'
import { AuthenticationConsent } from 'src/ui/authentication'
import { routeList } from './routeList'
import { AppInit } from './ui/generic/appInit'
import BottomTabBar from 'src/ui/generic/bottomTabBar'
import strings from './locales/strings'

import {
  IdentityMenuIcon,
  RecordsMenuIcon,
  DocumentsMenuIcon,
  SettingsMenuIcon,
} from 'src/resources'

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

const defaultHeaderBackgroundColor =
  Platform.OS === 'android'
    ? JolocomTheme.primaryColorBlack
    : JolocomTheme.primaryColorGrey

const defaultHeaderTintColor =
  Platform.OS === 'android'
    ? JolocomTheme.primaryColorWhite
    : JolocomTheme.primaryColorBlack

const headerTitleStyle: StyleProp<TextStyle> = {
  fontSize: JolocomTheme.headerFontSize,
  fontFamily: JolocomTheme.contentFontFamily,
  fontWeight: '300',
  color: defaultHeaderTintColor,
}

const commonNavigationOptions: NavigationScreenOptions = {
  headerTitleStyle,
  headerStyle: {
    backgroundColor: defaultHeaderBackgroundColor,
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
      headerTintColor: JolocomTheme.primaryColorPurple,
    },
  }),
}

const bottomTabBarBackground =
  Platform.OS == 'android'
    ? '#fafafa' // FIXME add to theme
    : JolocomTheme.primaryColorBlack

export const BottomTabBarRoutes = {
  [routeList.Claims]: {
    screen: Claims,
    title: strings.MY_IDENTITY,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: IdentityMenuIcon,
    },
  },
  [routeList.Documents]: {
    screen: Documents,
    title: strings.DOCUMENTS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: (props: {
        tintColor: string
        focused: boolean
        fillColor?: string
      }) => {
        props.fillColor = bottomTabBarBackground
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
    },
  },
  [routeList.Settings]: {
    screen: Settings,
    title: strings.SETTINGS,
    navigationOptions: {
      ...commonNavigationOptions,
      tabBarIcon: SettingsMenuIcon,
    },
  },
}

const BottomTabNavigator = createBottomTabNavigator(BottomTabBarRoutes, {
  tabBarOptions: {
    ...Platform.select({
      android: {
        activeTintColor: JolocomTheme.primaryColorPurple,
        inactiveTintColor: '#9B9B9E', // FIXME
      },
      ios: {
        activeTintColor: JolocomTheme.primaryColorWhite,
        inactiveTintColor: 'rgba(255, 255, 255, 0.5)',
      },
    }),
    showLabel: false,
    style: {
      height: 50,
      bottom: 0,
      backgroundColor: bottomTabBarBackground,
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
    [routeList.Entropy]: {
      screen: Entropy,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.RegistrationProgress]: {
      screen: RegistrationProgress,
      navigationOptions: noHeaderNavOpts,
    },
    [routeList.SeedPhrase]: {
      screen: SeedPhrase,
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
    [routeList.QRCodeScanner]: {
      screen: QRScannerContainer,
      navigationOptions: navOptScreenWCancel,
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
    [routeList.Exception]: {
      screen: Exception,
      navigationOptions: noHeaderNavOpts,
    },
  },
  {
    defaultNavigationOptions: commonNavigationOptions,
  },
)

export const Routes = createSwitchNavigator(
  {
    [routeList.AppInit]: {
      screen: AppInit,
      navigationOptions: noHeaderNavOpts,
    },
    MainStack,
    RegistrationScreens,
  },
  {
    initialRouteName: routeList.AppInit,
  },
)

export const RoutesContainer = createAppContainer(Routes)
