import React, { ReactNode } from 'react'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import {
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  RegisteredStyle,
} from 'react-native'

/**
 * Atomic UI elements are claim card wrapper and claim card
 * Section claim card combines the claim card outer wrapper and claim card
 */

interface ClaimCardWrapperProps {
  leftIcon: ReactNode
  rightIcon?: ReactNode
  containerStyle?: ViewStyle | RegisteredStyle<ViewStyle>
  title?: string
}

export const ClaimCardWrapper: React.SFC<ClaimCardWrapperProps> = props => {
  const styles = {
    defaultContainerStyle: {
      flexDirection: 'row',
      paddingTop: '3%',
      justifyContent: 'space-between',
      backgroundColor: JolocomTheme.primaryColorWhite,
    } as ViewStyle,
    defaultTitleStyle: {
      alignSelf: 'flex-start',
      ...JolocomTheme.textStyles.light.labelDisplayFieldEdit,
      color: '#05050d',
      fontFamily: JolocomTheme.contentFontFamily,
    } as ViewStyle,
    defaultClaimSectionStyle: {
      flex: 0.65,
      justifyContent: 'space-between',
    } as ViewStyle,
    defaultLeftIconStyle: {
      alignItems: 'center',
      flex: 0.2,
    } as ViewStyle,
    defaultRightIconStyle: {
      flex: 0.15,
    },
  }

  return (
    <View style={[styles.defaultContainerStyle, props.containerStyle]}>
      <View style={styles.defaultLeftIconStyle}>{props.leftIcon}</View>
      <View style={styles.defaultClaimSectionStyle}>
        <Text style={styles.defaultTitleStyle}>
          {props.title ? props.title : ''}
        </Text>
      </View>
      <View style={styles.defaultRightIconStyle}>
        {props.rightIcon || null}
      </View>
    </View>
  )
}

interface ClaimCardProps {
  rightIcon?: ReactNode
  secondaryText?: string | ReactNode
  primaryText: string | ReactNode
  primaryTextStyle?: TextStyle | RegisteredStyle<TextStyle>
  secondaryTextStyle?: TextStyle | RegisteredStyle<TextStyle>
  containerStyle?: ViewStyle | RegisteredStyle<ViewStyle>
}

export const ClaimCard: React.SFC<ClaimCardProps> = props => {
  const styles = StyleSheet.create({
    primaryTextDefault: {
      fontFamily: JolocomTheme.contentFontFamily,
      fontSize: JolocomTheme.headerFontSize,
      color: JolocomTheme.primaryColorBlack,
      fontWeight: '100',
    } as TextStyle,
    secondaryTextDefault: {
      fontSize: 17,
      opacity: 0.4,
    } as TextStyle,
    containerDefault: {
      flex: 0.8,
      marginBottom: '5%',
      justifyContent: 'center',
    },
  })

  const {
    primaryText,
    secondaryText,
    rightIcon,
    primaryTextStyle,
    secondaryTextStyle,
    containerStyle,
  } = props
  const { primaryTextDefault, secondaryTextDefault, containerDefault } = styles

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
      }}
    >
      <View style={[containerDefault, containerStyle]}>
        <Text style={[primaryTextDefault, primaryTextStyle]}>
          {primaryText}
        </Text>
        <Text
          style={[primaryTextDefault, secondaryTextDefault, secondaryTextStyle]}
        >
          {secondaryText}
        </Text>
      </View>
      <View flex={0.2}>{rightIcon}</View>
    </View>
  )
}

interface SectionClaimCardProps {
  title: string
  primaryText: string | ReactNode
  leftIcon: ReactNode
  rightIcon?: ReactNode
  secondaryText?: string | ReactNode
  primaryTextStyle?: TextStyle | RegisteredStyle<TextStyle>
  secondaryTextStyle?: TextStyle | RegisteredStyle<TextStyle>
  containerStyleWrapper?: ViewStyle | RegisteredStyle<ViewStyle>
  containerStyleClaimCard?: ViewStyle | RegisteredStyle<ViewStyle>
}

export const SectionClaimCard: React.SFC<SectionClaimCardProps> = props => {
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
    },
    containerStyleClaimCardDefault: {
      paddingLeft: '20%',
    },
    containerStyleWrapperDefault: {
      paddingTop: '5%',
      marginTop: 1,
    },
  })

  return (
    <View style={styles.mainContainer}>
      <ClaimCardWrapper
        leftIcon={props.leftIcon}
        containerStyle={
          props.containerStyleWrapper || styles.containerStyleWrapperDefault
        }
        title={props.title}
      />
      <ClaimCard
        primaryText={props.primaryText}
        secondaryText={props.secondaryText}
        primaryTextStyle={props.primaryTextStyle}
        secondaryTextStyle={props.secondaryTextStyle}
        containerStyle={
          props.containerStyleClaimCard || styles.containerStyleClaimCardDefault
        }
        rightIcon={props.rightIcon}
      />
    </View>
  )
}
