import React from 'react'
import { connect } from 'react-redux'
import { navigationActions } from 'src/actions/'
import {
  Text,
  StyleSheet,
  View,
  Image,
  BackHandler,
  StatusBar,
} from 'react-native'
import I18n from 'src/locales/i18n'
import { errorTitleMessages, AppError } from 'src/lib/errors'
import { getRandomStringFromArray } from 'src/utils/getRandomStringFromArray'
import strings from 'src/locales/strings'
import { ThunkDispatch } from '../../store'
import { NavigationInjectedProps } from 'react-navigation'
import { Colors, Spacing, Typography } from 'src/styles'
import { JolocomButton } from '../structure'
import { routeList } from '../../routeList'
const errorImage = require('src/resources/img/error_image.png')

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationInjectedProps {
  errorTitle?: string
}

interface State {
  reportSent: boolean
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.blackMain,
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '5%',
  },
  upperContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing['4XL'],
  },
  textBlock: {
    marginTop: Spacing.LG,
    paddingHorizontal: Spacing.MD,
    alignItems: 'center',
  },
  errorTextHeader: {
    ...Typography.mainText,
    textAlign: 'center',
    color: Colors.sandLight,
  },
  errorText: {
    ...Typography.subMainText,
    textAlign: 'center',
    color: Colors.sandLight,
    marginTop: Spacing.MD,
  },
  buttonBlock: {
    marginTop: Spacing.LG,
    flex: 0.8,
    justifyContent: 'space-evenly',
  },
})

export class ExceptionComponent extends React.Component<Props, State> {
  private onBackButtonPressAndroid = (): boolean => {
    this.handleTapBack()
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

  private handleTapBack = (): void => {
    const { navigation } = this.props
    if (navigation) {
      this.props.navigateBack(
        navigation?.state?.params?.returnTo,
      )
    }
  }

  private getError = (): AppError | Error | undefined => {
    return this.props.navigation?.state?.params?.error
  }

  public render(): JSX.Element | null {
    // TODO: display error code
    const err = this.getError()
    const origError = err instanceof AppError && err.origError
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
          <JolocomButton
            onPress={this.handleTapBack}
            text={I18n.t(strings.GO_BACK)}
          />
          {err && (
            <JolocomButton
              onPress={() => this.props.navigateReporting(err)}
              text={I18n.t(strings.SEND_ERROR_REPORT)}
            />
          )}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (): {} => ({})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: (routeName: string) =>
    dispatch(navigationActions.navigate({ routeName })),
  navigateReporting: (error: AppError | Error | undefined) =>
    dispatch(
      navigationActions.navigate({
        routeName: routeList.ErrorReporting,
        params: { error },
      }),
    ),
})

export const Exception = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExceptionComponent)
