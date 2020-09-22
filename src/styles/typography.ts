import { Dimensions, Platform } from 'react-native'
import { Colors } from '.'

const initialViewportWidth = Dimensions.get('window').width
// const initialViewportHeight = Dimensions.get('window').height

const isSmallViewportWidth = initialViewportWidth < 360

export const fontMain = Platform.OS === 'android' ? 'TTCommons' : 'TT Commons'
export const fontLight = 'TTCommons-Light'
export const fontMedium = 'TTCommons-Medium'

export const text3XS = 12
export const textXXS = 14
export const textXS = 16
export const textSM = 18
export const textMD = 20
export const textLG = 22
export const textXL = 28
export const textXXL = 30
export const text3XL = 34
export const text4XL = 42

export const textHeader = isSmallViewportWidth ? textXL : textXXL
export const textSubheader = isSmallViewportWidth ? textXS : textSM
export const textSubheaderLineHeight = isSmallViewportWidth ? 18 : 22

export const centeredText = {
  textAlign: 'center' as 'center',
}

export const baseFontStyles = {
  fontFamily: fontMain,
}

/* PRESETS */

// on 'dark screens' e.g. exception and landing, the main text
export const mainText = {
  ...baseFontStyles,
  fontSize: textHeader,
}

// on 'dark screens' e.g. exception and landing, the smaller text
export const subMainText = {
  ...baseFontStyles,
  fontSize: textSubheader,
}

// this is used for button text, iOS header
export const standardText = {
  ...baseFontStyles,
  fontSize: textLG,
}

// used as the main text for cards like claimCards, issuerCard etc.
export const cardMainText = {
  ...baseFontStyles,
  fontSize: textLG,
  color: Colors.blackMain,
}

export const cardMainTextPurple = {
  ...cardMainText,
  color: Colors.purpleMain,
}

// used for the label, subtext of cards, callbackURL, address etc.
export const cardSecondaryText = {
  ...baseFontStyles,
  fontSize: textXS,
  color: Colors.blackMain040,
}

export const cardSecondaryTextBlack = {
  ...cardSecondaryText,
  color: Colors.blackMain,
}

// e.g. Personal, Contact on credentialOverview same as the above
// cardSecondaryText
export const sectionHeader = {
  ...baseFontStyles,
  fontSize: textXS,
  color: Colors.blackMain040,
}

export const noteText = {
  ...baseFontStyles,
  fontSize: textMD,
  color: Colors.sandLight,
  lineHeight: 23,
}

export const largeText = {
  ...baseFontStyles,
  fontSize: textXXL,
  color: Colors.white,
  lineHeight: text3XL + 4,
}
