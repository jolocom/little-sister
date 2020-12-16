import { Colors } from 'src/ui/deviceauth/colors'
import BP from './breakpoints'
import { fontMain, fontMedium, fontLight } from 'src/styles/typography'

export const Fonts = {
  Regular: fontMain,
  Medium: fontMedium,
  Light: fontLight,
}

type FontSetI = {
  fontSize: number
  lineHeight: number
  letterSpacing: number
  color: Colors
  fontFamily: string
}

export enum JoloTextSizes {
  big = 'big',
  middle = 'middle',
  mini = 'mini',
  tiniest = 'tiniest',
}

const arrangeFontStyle = (
  fontSize: number,
  lineHeight: number,
  letterSpacing: number,
  color: Colors,
  fontFamily: string,
): FontSetI => ({
  fontSize,
  lineHeight,
  letterSpacing,
  color,
  fontFamily,
})

export const titleFontStyles: Record<JoloTextSizes, FontSetI> = {
  big: {
    ...arrangeFontStyle(
      BP({ xsmall: 26, small: 30, default: 34 }),
      BP({ xsmall: 32, small: 36, default: 40 }),
      0,
      Colors.white90,
      Fonts.Medium,
    ),
  },
  middle: {
    ...arrangeFontStyle(
      BP({ xsmall: 24, default: 28 }),
      BP({ xsmall: 28, default: 32 }),
      0,
      Colors.white90,
      Fonts.Medium,
    ),
  },
  mini: {
    ...arrangeFontStyle(
      BP({ xsmall: 14, default: 18 }),
      BP({ xsmall: 20, default: 24 }),
      0,
      Colors.white90,
      Fonts.Medium,
    ),
  },
  tiniest: {
    ...arrangeFontStyle(14, 20, 0, Colors.white70, Fonts.Medium),
  },
}

export const subtitleFontStyles = {
  big: {
    ...arrangeFontStyle(
      BP({ xsmall: 18, small: 20, default: 22 }),
      BP({ xsmall: 22, small: 24, default: 26 }),
      BP({ xsmall: 0.12, small: 0.14, default: 0.15 }),
      BP({
        default: Colors.white90,
        medium: Colors.white80,
        large: Colors.white80,
      }),
      Fonts.Regular,
    ),
  },
  middle: {
    ...arrangeFontStyle(
      BP({ default: 16, medium: 20, large: 20 }),
      BP({ default: 18, medium: 22, large: 22 }),
      BP({ default: 0.11, medium: 0.14, large: 0.14 }),
      BP({
        default: Colors.white90,
        medium: Colors.white70,
        large: Colors.white70,
      }),
      Fonts.Regular,
    ),
  },
  mini: {
    ...arrangeFontStyle(
      BP({ xsmall: 14, default: 16 }),
      BP({ xsmall: 14, default: 16 }),
      0,
      Colors.white40,
      Fonts.Regular,
    ),
  },
  tiniest: {
    ...arrangeFontStyle(14, 20, 0, Colors.white70, Fonts.Regular),
  },
}
