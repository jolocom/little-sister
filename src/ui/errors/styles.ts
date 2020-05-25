import { fontMain } from '../../styles/typography'
import { Platform, StyleSheet } from 'react-native'
import { isFinalStyle } from '../../styles/config'
import { Colors } from '../../styles'
import { BP } from '../../styles/breakpoints'
import { mergeDeepLeft } from 'ramda'

const borderStyle = {
  borderWidth: 1,
  borderRadius: 8,
}

const defaultText = {
  fontFamily: fontMain,
  fontSize: 20,
}

const finalStyles = StyleSheet.create({
  sectionWrapper: {
    width: '100%',
    height: 'auto',
    paddingHorizontal: BP({
      small: 16,
      medium: 20,
      large: 20,
    }),
    marginTop: 50,
  },
  sectionTitle: {
    fontFamily: fontMain,
    color: Colors.sandLight080,
    fontSize: BP({
      small: 26,
      medium: 28,
      large: 28,
    }),
  },
  sectionDescription: {
    ...defaultText,
    color: Colors.white,
    fontSize: 16,
    letterSpacing: 0.11,
    lineHeight: 20,
  },
  pickerWrapper: {
    ...borderStyle,
    backgroundColor: Colors.mediumBlack,
    borderColor: Colors.white021,
    paddingLeft: 10,
    height: 50,
    width: '100%',
    justifyContent: Platform.select({
      android: 'center',
      ios: 'flex-end',
    }),
  },
  pickerIconWrapper: {
    position: 'absolute',
    height: '100%',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pickerDropDown: {
    ...borderStyle,
    borderColor: Colors.white021,
    backgroundColor: Colors.black,
    paddingVertical: 10,
  },
  pickerDropdownText: {
    backgroundColor: 'transparent',
    paddingLeft: 20,
    height: 46,
    paddingTop: Platform.select({
      ios: 14,
      android: 0,
    }),
  },
  inputText: {
    ...defaultText,
    color: Colors.white,
    padding: 10,
  },
  inputBlock: {
    ...borderStyle,
    ...defaultText,
    color: Colors.white,
    height: 90,
    maxWidth: '100%',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingTop: 13,
    flexWrap: 'wrap',
    backgroundColor: Colors.mediumBlack,
    borderColor: Colors.white021,
  },
  inputLine: {
    ...defaultText,
    color: Colors.white,
    width: '100%',
    borderBottomColor: Colors.white,
    borderBottomWidth: 1,
    marginTop: 16,
    paddingVertical: 12,
  },
  switchSection: {
    flexDirection: 'row',
    marginTop: 20,
  },
  switchWrapper: {
    width: 70,
    height: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  emojiWrapper: {
    maxWidth: '100%',
    height: 'auto',
    marginTop: 27,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: Platform.select({
      ios: BP({
        small: 59,
        medium: 66,
        large: 66,
      }),
      android: 60,
    }),
    height: Platform.select({
      ios: BP({
        small: 59,
        medium: 66,
        large: 66,
      }),
      android: 60,
    }),
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black050,
  },
  selectedEmoji: {
    borderColor: Colors.joloColor,
    backgroundColor: Colors.black050,
  },
  unselectedEmoji: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: Platform.select({
      ios: BP({
        small: 28,
        medium: 31,
        large: 31,
      }),
      android: 23,
    }),
    color: Colors.black,
  },
  navigationWrapper: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigationButton: {
    height: 40,
    paddingHorizontal: BP({
      small: 16,
      medium: 20,
      large: 20,
    }),
    justifyContent: 'center',
  },
  // NOTE inline colors for switching between the intermediate and final versions
  highlightBorder: {
    borderColor: Colors.joloColor,
  },
  highlightBottomBorder: {
    borderBottomColor: Colors.joloColor,
  },
  defaultBorder: {
    borderColor: Colors.white021,
  },
  defaultBottomBorder: {
    borderBottomColor: Colors.white021,
  },
  selectedText: {
    color: Colors.joloColor,
  },
  defaultText: {
    color: Colors.white,
  },
  unselectedText: {
    color: Colors.white050,
  },
  gradientOff: {
    color: 'rgb(12, 12, 12)',
  },
  gradientOnStart: {
    color: 'rgb(145, 25, 66)',
  },
  gradientOnEnd: {
    color: 'rgb(210, 45, 105)',
  },
  trackColor: {
    color: Colors.darkGrey,
  },
})

const intermediateStyles = StyleSheet.create({
  sectionTitle: {
    color: Colors.baseBlack,
    fontSize: BP({
      small: 26,
      medium: 30,
      large: 30,
    }),
    lineHeight: 34,
  },
  sectionDescription: {
    color: Colors.iTextBlack,
  },
  pickerWrapper: {
    backgroundColor: Colors.white,
    borderColor: Colors.iGrey,
  },
  pickerDropDown: {
    borderColor: Colors.iGrey,
    backgroundColor: Colors.white,
  },
  inputText: {
    color: Colors.black,
  },
  inputBlock: {
    color: Colors.black,
    backgroundColor: Colors.white,
    borderColor: Colors.iGrey,
  },
  inputLine: {
    color: Colors.black,
    borderBottomColor: Colors.darkGrey,
  },
  emojiButton: {
    borderColor: Colors.iLightGrey,
    backgroundColor: Colors.white,
  },
  selectedEmoji: {
    borderColor: Colors.iJoloColor,
    backgroundColor: Colors.white,
  },
  emoji: {
    color: Colors.black,
  },

  // NOTE inline colors for switching between the intermediate and final versions
  highlightBorder: {
    borderColor: Colors.iJoloColor,
  },
  highlightBottomBorder: {
    borderBottomColor: Colors.iJoloColor,
  },
  defaultBorder: {
    borderColor: Colors.iGrey,
  },
  defaultBottomBorder: {
    borderBottomColor: Colors.iInputBlack,
  },
  selectedText: {
    color: Colors.iJoloColor,
  },
  defaultText: {
    color: Colors.black,
  },
  unselectedText: {
    color: Colors.black050,
  },
  gradientOff: {
    color: Colors.iLightGrey,
  },
  gradientOnStart: {
    color: 'rgb(145, 25, 66)',
  },
  gradientOnEnd: {
    color: 'rgb(210, 45, 105)',
  },
  trackColor: {
    color: Colors.white,
  },
})

export const styles = isFinalStyle
  ? finalStyles
  : mergeDeepLeft(intermediateStyles, finalStyles)
