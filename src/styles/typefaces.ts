import { BP } from './breakpoints'
import { Colors, Typography } from './index'

export const largeTitle = {
  fontFamily: Typography.fontMedium,
  fontSize: BP({
    small: 30,
    medium: 34,
    large: 34,
  }),
  lineHeight: BP({
    small: 34,
    medium: 40,
    large: 40,
  }),
  letterSpacing: 0,
  color: Colors.sandLight,
}

export const seedphrase = {
  fontFamily: BP({
    small: Typography.fontMain,
    medium: Typography.fontMedium,
    large: Typography.fontMedium,
  }),
  fontSize: BP({
    small: 24,
    medium: 30,
    large: 30,
  }),
  lineHeight: BP({
    small: 26,
    medium: 36,
    large: 36,
  }),
  letterSpacing: 0,
  color: BP({
    small: Colors.white,
    medium: Colors.sandLight,
    large: Colors.sandLight,
  }),
}

export const title1 = {
  fontFamily: Typography.fontMedium,
  fontSize: 28,
  lineHeight: 34,
  letterSpacing: 0,
  color: Colors.sandLight,
}

export const title2 = {
  fontFamily: BP({
    small: Typography.fontMedium,
    medium: Typography.fontMain,
    large: Typography.fontMain,
  }),
  fontSize: BP({
    small: 26,
    medium: 28,
    large: 28,
  }),
  lineHeight: BP({
    small: 32,
    medium: 34,
    large: 34,
  }),
  letterSpacing: 0,
  color: Colors.sandLight,
}

export const subtitle1 = {
  fontFamily: Typography.fontMain,
  fontSize: BP({
    small: 18,
    medium: 22,
    large: 22,
  }),
  lineHeight: BP({
    small: 22,
    medium: 26,
    large: 26,
  }),
  letterSpacing: BP({
    small: -0.1,
    medium: 0.15,
    large: 0.15,
  }),
  color: Colors.sandLight,
}

export const subtitle2 = {
  fontFamily: Typography.fontMain,
  fontSize: BP({
    small: 18,
    medium: 22,
    large: 22,
  }),
  lineHeight: BP({
    small: 22,
    medium: 24,
    large: 24,
  }),
  letterSpacing: BP({
    small: 0.09,
    medium: 0.1,
    large: 0.1,
  }),
  color: Colors.sandLight,
}

export const subtitle3 = {
  fontFamily: Typography.fontMain,
  fontSize: 16,
  lineHeight: 22,
  letterSpacing: -0.18,
  color: Colors.white,
}

export const overline1 = {
  fontFamily: Typography.fontMedium,
  fontSize: 16,
  lineHeight: 20,
  letterSpacing: 0,
  color: Colors.white,
}

export const overline2 = {
  fontFamily: Typography.fontLight,
  fontSize: 14,
  letterSpacing: 0,
  color: Colors.white,
}

export const body1 = {
  fontFamily: Typography.fontMain,
  fontSize: 16,
  lineHeight: 20,
  letterSpacing: -0.18,
  color: Colors.white,
}

export const caption = {
  fontFamily: Typography.fontLight,
  fontSize: 10,
  lineHeight: 14,
  letterSpacing: 0,
  color: Colors.white,
}
