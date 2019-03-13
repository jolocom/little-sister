import React from 'react'
import {
  addNavigationHelpers,
  NavigationEventSubscription,
  NavigationEventCallback,
} from 'react-navigation'
import { connect } from 'react-redux'
import { BackHandler, Linking, Platform, StatusBar } from 'react-native'
import { AnyAction } from 'redux'
import { Routes } from 'src/routes'
import { RootState } from 'src/reducers/'
import { navigationActions, accountActions } from 'src/actions/'
import { BottomActionBar } from './ui/generic/'
import { routeList } from './routeList'

const {
  createReduxBoundAddListener,
} = require('react-navigation-redux-helpers')

interface ConnectProps {
  navigation: RootState['navigation']
  openScanner: () => void
  goBack: () => void
  handleDeepLink: (url: string) => void
  checkIfAccountExists: () => void
}

interface OwnProps {
  dispatch: (action: AnyAction) => void
}

interface Props extends ConnectProps, OwnProps {}

export class NavigatorContainer extends React.Component<Props> {
  private addListener: (
    name: string,
    cb: NavigationEventCallback,
  ) => NavigationEventSubscription

  constructor(props: Props) {
    super(props)
    this.addListener = createReduxBoundAddListener('root')
  }

  UNSAFE_componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.navigateBack)
    if (Platform.OS === 'android') {
      Linking.getInitialURL().then((url: string) => {
        if (!url) {
          this.props.checkIfAccountExists()
        } else {
          this.props.handleDeepLink(url)
        }
      })
    } else {
      Linking.addEventListener('url', this.handleOpenURL)
      // TODO: test with deep linking on ios
      Linking.getInitialURL().then((url: string) => {
        if (!url) {
          this.props.checkIfAccountExists()
        } else {
          this.props.handleDeepLink(url)
        }
      })
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.navigateBack)
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  private navigateBack = () => {
    // return false if app exit is desired
    if (
      this.props.navigation.index === 0 &&
      this.props.navigation.routes.length === 1 &&
      this.props.navigation.routes[0].index === 0
    ) {
      return false
    }

    console.log(this.props.navigation)
    this.props.goBack()
    return true
  }

  //When handleOpenURL is called, we pass the event url to the navigate method.
  private handleOpenURL = (event: any) => {
    this.props.handleDeepLink(event.url)
  }

  render() {
    const { routes, index } = this.props.navigation
    const currentRoute = routes[index].routeName
    return [
      <StatusBar barStyle="light-content" />,
      <Routes
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.navigation,
          addListener: this.addListener,
        })}
      />,
      currentRoute === routeList.Home && (
        <BottomActionBar openScanner={this.props.openScanner} />
      ),
    ]
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    navigation: state.navigation,
  }
}

const mapDispatchToProps = (dispatch: Function) => {
  return {
    goBack: () => dispatch(navigationActions.goBack()),
    handleDeepLink: (url: string) =>
      dispatch(navigationActions.handleDeepLink(url)),
    openScanner: () =>
      dispatch(
        navigationActions.navigate({ routeName: routeList.QRCodeScanner }),
      ),
    checkIfAccountExists: () => dispatch(accountActions.checkIdentityExists()),
  }
}

export const Navigator = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NavigatorContainer)
