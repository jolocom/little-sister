import { Colors } from '../colors'
import { fontLight, fontMain, fontMedium } from '../../../styles/typography'

export enum Fonts {
  Regular = fontMain,
  Medium = fontMedium,
  Light = fontLight,
}

export const TextStyle = {
  middleTitleRegular: {
    fontFamily: Fonts.Regular,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0,
    color: Colors.white90,
  },
  middleSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: 0.14,
    color: Colors.white,
    opacity: 0.7,
  },
  largeSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: 0.15,
    color: Colors.white,
    opacity: 0.8,
  },
  seedPhrase: {
    fontFamily: Fonts.Medium,
    fontSize: 40,
    lineHeight: 54,
    letterSpacing: 0,
    color: Colors.activity,
  },
}
