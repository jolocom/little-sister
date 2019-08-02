import * as React from 'react'
import { connect } from 'react-redux'

import { ThunkDispatch } from 'src/store'
import { navigationActions, accountActions, genericActions } from 'src/actions'
import { Linking, Dimensions, Image, StyleSheet } from 'react-native'
import { withLoading, withErrorHandler } from 'src/actions/modifiers'
import { Container, CenteredText } from '../structure'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { AppError, ErrorCode } from 'src/lib/errors'
import { showErrorScreen } from 'src/actions/generic'
const image = require('src/resources/img/splashScreen.png')

interface Props extends ReturnType<typeof mapDispatchToProps> {}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: '#05050d',
  },
  loadingText: {
    position: 'absolute',
    bottom: '5%',
    fontSize: 12,
    fontFamily: JolocomTheme.contentFontFamily,
    color: JolocomTheme.primaryColorSand,
    opacity: 0.7,
  },
})

export class AppInitContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.props.doAppInit()
  }

  render() {
    const viewWidth: number = Dimensions.get('window').width
    const viewHeight: number = Dimensions.get('window').height

    return (
      <Container style={styles.loadingContainer}>
        <Image
          source={image}
          style={{
            bottom: '15%',
            width: viewWidth,
            height: viewHeight / 2,
          }}
        />
        <CenteredText style={styles.loadingText} msg={'POWERED BY JOLOCOM'} />
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  doAppInit: async () => {
    const withErrorScreen = withErrorHandler(
      showErrorScreen,
      (err: Error) => new AppError(ErrorCode.AppInitFailed, err),
    )
    await dispatch(withErrorScreen(genericActions.initApp))
    await dispatch(withErrorScreen(accountActions.checkIdentityExists))
    const handleDeepLink = (url: string) =>
      dispatch(
        withLoading(withErrorScreen(navigationActions.handleDeepLink(url))),
      )

    // FIXME: get rid of these after setting up deepLinking properly using
    // react-navigation
    Linking.addEventListener('url', event => handleDeepLink(event.url))
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url)
    })
  },
})

export const AppInit = connect(
  null,
  mapDispatchToProps,
)(AppInitContainer)
