import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-native-material-ui'
import { navigationActions } from 'src/actions/'
import { Text, StyleSheet, View, Image } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { routeList } from 'src/routeList'
import I18n from 'src/locales/i18n'
import { AppError, errorTitleMessages } from 'src/lib/errors'
import { getRandomStringFromArray } from 'src/utils/getRandomStringFromArray'
import {ThunkDispatch} from '../../store'
const errorImage = require('src/resources/img/error_image.png')

interface ConnectProps {
  navigateBack: (routeName: string) => ReturnType<typeof navigationActions.navigatorReset>
}

interface Props extends ConnectProps {
  navigation: {
    state: {
      params: {
        returnTo: routeList
        error: Error & AppError
      }
    }
  }
  errorTitle?: string
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: JolocomTheme.primaryColorBlack,
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

export const ExceptionComponent: React.SFC<Props> = (props): JSX.Element => {
  // TODO: display error code
  const err = props.navigation.state.params.error
  const errorTitle =
    props.errorTitle || getRandomStringFromArray(errorTitleMessages)
  let errorText = err ? err.message : 'There was an error with your request'
  errorText = I18n.t(errorText) + '.'
  console.error(err && err.origError ? err.origError : err)

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <Image source={errorImage} style={{ width: 160, height: 160 }} />
        <View style={styles.textBlock}>
          <Text style={styles.errorTextHeader}>{I18n.t(errorTitle)}</Text>
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      </View>
      <View style={styles.buttonBlock}>
        <Button
          raised
          onPress={() =>
            props.navigateBack(props.navigation.state.params.returnTo)
          }
          style={{
            container: styles.buttonContainer,
            text: styles.buttonText,
          }}
          upperCase={false}
          text={I18n.t('Go back')}
        />
      </View>
    </View>
  )
}

const mapStateToProps = (): {} => ({})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  navigateBack: (routeName: string) => navigationActions.navigatorReset({routeName}),
})

export const Exception = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ExceptionComponent)
