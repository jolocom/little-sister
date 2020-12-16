import { Colors, Typography, Spacing } from 'src/styles'
import { textSM } from './typography'

export const buttonStandardContainer = {
  height: 48,
  borderRadius: 8,
}

export const buttonStandardText = {
  textAlign: 'center',
  fontSize: textSM,
  // React Material Button uses a default weight, 500, that isn't supported by
  // our font on Android, so we must manually define it here
  // 2019-08-07: currently different fontWeights have no effect
  fontWeight: 'normal' as 'normal',
  color: Colors.white,
  // this is a hack, used because the lineHeight of our font causes it to be not
  // centered vertically within the button
  // the 'as' is also a hack to get around a ts-jest issue with enums
  // https://github.com/kulshekhar/ts-jest/issues/281
  //paddingVertical: 16 as Spacing.MD,
}

export const buttonDisabledStandardContainer = {
  ...buttonStandardContainer,
  backgroundColor: Colors.disabledButtonBackground,
}

export const buttonDisabledStandardText = {
  ...buttonStandardText,
  color: Colors.disabledButtonText,
}

export const buttonConsentTextBase = {
  fontSize: Typography.textMD,
  fontFamily: Typography.fontMain,
  fontWeight: 'normal' as 'normal',
  /**
   * @TODO fix this hack. There is an issue with ts-jest and enums.
   * https://github.com/kulshekhar/ts-jest/issues/281
   * Instead of using 'as', we should have a way of linking this value to the
   * spacing file. Right now the spacing doesn't contribute to this styling.
   */
  paddingVertical: 8 as Spacing.XS,
}
