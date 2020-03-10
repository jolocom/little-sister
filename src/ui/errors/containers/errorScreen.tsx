import React, { useEffect } from 'react'
import { BackHandler, StyleSheet, Text, View } from 'react-native'
import { JolocomButton, Wrapper } from '../../structure'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { centeredText, fontMain, fontMedium } from '../../../styles/typography'
import { Colors, Typefaces } from '../../../styles'
import { BlueCircleImage, RedCircleImage } from '../../../resources'
import { BP } from '../../../styles/breakpoints'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import { navigationActions } from '../../../actions'
import { routeList } from '../../../routeList'

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.overflowBlack,
    justifyContent: 'space-between',
  },
  imageWrapper: {
    marginTop: '15%',
    width: '65%',
    height: '54%',
  },
  title: {
    ...Typefaces.title2,
    ...centeredText,
    fontFamily: fontMedium,
    color: Colors.sandLight090,
    paddingHorizontal: 10,
  },
  message: {
    ...centeredText,
    fontFamily: fontMain,
    lineHeight: BP({
      small: 20,
      medium: 20,
      large: 24,
    }),
    fontSize: BP({
      small: 18,
      medium: 18,
      large: 20,
    }),
    marginTop: 13,
    paddingHorizontal: 26,
    color: Colors.sandLight080,
  },
  interactButton: {
    marginTop: 14,
    borderColor: 'white',
    borderWidth: 0.5,
  },
  buttonSection: {
    flex: 0.3,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  contentSection: {
    flex: 0.7,
    width: '100%',
    alignItems: 'center',
  },
})

export enum ImageType {
  Red = 'red',
  Blue = 'blue',
}

export interface ErrorScreenParams {
  title: string
  message: string
  image?: ImageType
  interact?: {
    label: string
    onInteract: () => void | Promise<void>
  }
  dismiss: {
    label: string
    onDismiss: () => void | Promise<void>
  }
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<NavigationState, ErrorScreenParams>
}

const ErrorScreenContainer: React.FC<Props> = props => {
  const {
    resetNavigation,
    navigation: {
      state: {
        params: { title, message, interact, dismiss, image },
      },
    },
  } = props

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackButtonPress)

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackButtonPress)
    }
  }, [])

  const onBackButtonPress = (): boolean => {
    resetNavigation()
    return true
  }

  return (
    <Wrapper style={styles.wrapper}>
      <View style={styles.contentSection}>
        <View style={styles.imageWrapper}>
          {image === ImageType.Red ? <RedCircleImage /> : <BlueCircleImage />}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.buttonSection}>
        <JolocomButton
          onPress={dismiss.onDismiss}
          transparent
          text={dismiss.label}
        />
        {interact && (
          <JolocomButton
            containerStyle={styles.interactButton}
            transparent
            onPress={interact.onInteract}
            text={interact.label}
          />
        )}
      </View>
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  resetNavigation: () =>
    dispatch(navigationActions.navigate({ routeName: routeList.AppInit })),
})

export const ErrorScreen = connect(
  null,
  mapDispatchToProps,
)(ErrorScreenContainer)
