import { Platform  } from 'react-native'
import { StackNavigator, TabNavigator } from 'react-navigation'
import { Claims, Interactions, Records, ClaimDetails } from 'src/ui/home/'
import { Landing } from 'src/ui/landing/'
import { PaymentConsent } from 'src/ui/payment'
import { SeedPhrase, Loading, Entropy } from 'src/ui/registration/'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Exception, SlidingTabBar} from 'src/ui/generic/'
import { Consent } from 'src/ui/sso'
import { CredentialReceive } from 'src/ui/home'
import { Settings } from 'src/ui/settings'
import I18n from 'src/locales/i18n'
import { QRScannerContainer } from 'src/ui/generic/qrcodeScanner'
import { AuthenticationConsent } from 'src/ui/authentication'
import { routeList } from './routeList'

import {
  IdentityMenuIcon,
  RecordsMenuIcon,
  DocumentsMenuIcon,
  SettingsMenuIcon,
} from 'src/resources'

const headerBackImage =
  Platform.OS === 'android'
    ? require('./resources/img/close.png')
    : require('./resources/img/back-26.png')

const navigationOptions = {
  header: null,
}

const navOptScreenWCancel = {
  headerStyle: {
    backgroundColor:
      Platform.OS === 'android'
        ? JolocomTheme.primaryColorBlack
        : JolocomTheme.primaryColorGrey,
  },
  headerBackImage,
  ...Platform.select({
    ios: {
      headerBackTitleStyle: {
        color: JolocomTheme.primaryColorPurple,
      },
      headerTintColor: { color: JolocomTheme.primaryColorPurple },
    },
  }),
}

const headerTitleStyle = {
  fontSize: JolocomTheme.headerFontSize,
  fontFamily: JolocomTheme.contentFontFamily,
  fontWeight: '300',
}

const defaultHeaderBackgroundColor =
  Platform.OS === 'android'
    ? JolocomTheme.primaryColorBlack
    : JolocomTheme.primaryColorGrey

const defaultHeaderTintColor =
  Platform.OS === 'android'
    ? JolocomTheme.primaryColorWhite
    : JolocomTheme.primaryColorBlack

const commonNavigationOptions = {
  headerTitleStyle,
  headerStyle: {
    backgroundColor: defaultHeaderBackgroundColor,
    borderBottomWidth: 0,
  },
  headerTintColor: defaultHeaderTintColor,
}

const bottomNavBarBackground =
  Platform.OS == 'android'
    ? '#fafafa' // FIXME add to theme
    : JolocomTheme.primaryColorBlack

export const BottomNavRoutes = TabNavigator(
  {
    [routeList.Claims]: {
      screen: Claims,
      navigationOptions: () => ({
        ...commonNavigationOptions,
        headerTitle: I18n.t('My identity'),
        tabBarIcon: IdentityMenuIcon,
      }),
    },
    [routeList.Documents]: {
      screen: Interactions,
      navigationOptions: () => ({
        ...commonNavigationOptions,
        headerTitle: I18n.t('Documents'),
        tabBarIcon: (props: {
          tintColor: string
          focused: boolean
          fillColor?: string
        }) => {
          props.fillColor = bottomNavBarBackground
          return new DocumentsMenuIcon(props)
        },
      }),
    },
    [routeList.Records]: {
      screen: Records,
      navigationOptions: () => ({
        ...commonNavigationOptions,
        headerTitle: I18n.t('Login records'),
        tabBarIcon: RecordsMenuIcon,
      }),
    },
    [routeList.Settings]: {
      screen: Settings,
      navigationOptions: () => ({
        ...commonNavigationOptions,
        headerTitle: I18n.t('Settings'),
        tabBarIcon: SettingsMenuIcon,
      }),
    },
  },
  {
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
        backgroundColor: bottomNavBarBackground,
      },
    },
    tabBarComponent: SlidingTabBar,
    tabBarPosition: 'bottom',
  },
)

export const Routes = StackNavigator({
  [routeList.Landing]: { screen: Landing, navigationOptions },
  [routeList.Entropy]: { screen: Entropy, navigationOptions },
  [routeList.Loading]: { screen: Loading, navigationOptions },
  [routeList.SeedPhrase]: { screen: SeedPhrase, navigationOptions },

  [routeList.Home]: { screen: BottomNavRoutes },
  [routeList.QRCodeScanner]: {
    screen: QRScannerContainer,
    navigationOptions: () => ({
      ...navOptScreenWCancel,
    }),
  },

  [routeList.CredentialDialog]: {
    screen: CredentialReceive,
    navigationOptions: () => ({
      headerTitle: I18n.t('Receiving new credential'),
      ...commonNavigationOptions,
    }),
  },
  [routeList.Consent]: {
    screen: Consent,
    navigationOptions: () => ({
      headerTitle: I18n.t('Share claims'),
      ...commonNavigationOptions,
    }),
  },
  [routeList.PaymentConsent]: {
    screen: PaymentConsent,
    navigationOptions: () => ({
      headerBackImage,
      headerTitle: I18n.t('Confirm payment'),
      ...commonNavigationOptions,
    }),
  },
  [routeList.AuthenticationConsent]: {
    screen: AuthenticationConsent,
    navigationOptions: () => ({
      headerBackImage,
      headerTitle: I18n.t('Authorization request'),
      ...commonNavigationOptions,
    }),
  },
  [routeList.ClaimDetails]: {
    screen: ClaimDetails,
    navigationOptions: () => navOptScreenWCancel,
  },
  [routeList.Exception]: { screen: Exception, navigationOptions },
})
