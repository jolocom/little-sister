import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-native-material-ui'
import { navigationActions } from 'src/actions/'
import {
  Text,
  StyleSheet,
  View,
  Image,
  BackHandler,
  StatusBar,
} from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'
import { errorTitleMessages } from 'src/lib/errors'
import { getRandomStringFromArray } from 'src/utils/getRandomStringFromArray'
import strings from 'src/locales/strings'
import { ThunkDispatch } from '../../store'
import { NavigationScreenProps } from 'react-navigation'
const errorImage = require('src/resources/img/error_image.png')

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationScreenProps {
  errorTitle?: string
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(5, 5, 13)',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    padding: '5%',
  },
  upperContainer: {
    marginTop: 85,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imagePlaceholder: {
    backgroundColor: 'grey',
    width: 160,
    height: 160,
  },
  textBlock: {
    marginTop: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  errorTextHeader: {
    textAlign: 'center',
    color: JolocomTheme.primaryColorSand,
    fontSize: JolocomTheme.landingHeaderFontSize,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  errorText: {
    marginTop: 15,
    textAlign: 'center',
    color: JolocomTheme.primaryColorSand,
    fontSize: JolocomTheme.labelFontSize,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  buttonBlock: {
    marginTop: 20,
    backgroundColor: JolocomTheme.primaryColorBlack,
  },
  buttonContainer: {
    height: 48,
    borderRadius: 4,
    backgroundColor: JolocomTheme.primaryColorPurple,
  },
  buttonText: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontFamily: JolocomTheme.contentFontFamily,
    color: JolocomTheme.primaryColorWhite,
    fontSize: JolocomTheme.headerFontSize,
    fontWeight: '100',
  },
})

export class ExceptionComponent extends React.PureComponent<Props> {
  private onBackButtonPressAndroid = (): boolean => {
    this.handlePress()
    return true
  }
  public componentDidMount(): void {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  public componentWillUnmount(): void {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.onBackButtonPressAndroid,
    )
  }

  private handlePress = (): void => {
    const { navigation } = this.props
    if (navigation) {
      this.props.navigateBack(
        navigation.state.params && navigation.state.params.returnTo,
      )
    }
  }

  public render(): JSX.Element | null {
    const stateParams =
      this.props.navigation &&
      this.props.navigation.state &&
      this.props.navigation.state.params
    if (!stateParams) return null

    // TODO: display error code
    const err = stateParams.error
    const origError = err && err.origError
    const origErrorMessage = origError && origError.message
    const errorTitle =
      this.props.errorTitle || getRandomStringFromArray(errorTitleMessages)
    let errorText = err
      ? err.message
      : strings.THERE_WAS_AN_ERROR_WITH_YOUR_REQUEST
    errorText = I18n.t(errorText) + '.'
    console.error(origError || err)

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.upperContainer}>
          <Image source={errorImage} style={{ width: 160, height: 160 }} />
          <View style={styles.textBlock}>
            <Text style={styles.errorTextHeader}>
              {I18n.t(errorTitle) + '.'}
            </Text>
            <Text numberOfLines={5} style={styles.errorText}>
              {errorText}
            </Text>
            {origErrorMessage && (
              <Text numberOfLines={5} style={styles.errorText}>
                {origErrorMessage}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.buttonBlock}>
          <Button
            raised
            onPress={this.handlePress}
            style={{
              container: styles.buttonContainer,
              text: styles.buttonText,
            }}
            upperCase={false}
            text={I18n.t(strings.GO_BACK)}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (): {} => ({})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: (routeName: string) =>
    dispatch(navigationActions.navigate({ routeName })),
})

export const Exception = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExceptionComponent)
