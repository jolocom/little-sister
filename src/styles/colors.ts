import { Platform } from 'react-native'

const isAndroid = Platform.OS === 'android'

// COLOR NAMES

export const black = 'black' // rgb(0, 0, 0)
export const black010 = 'rgba(0, 0, 0, 0.1)'
export const black030 = 'rgba(0, 0, 0, 0.3)'
export const black040 = 'rgba(0, 0, 0, 0.4)'
export const black050 = 'rgba(0, 0, 0, 0.5)'
export const overflowBlack = 'rgb(11, 3, 13)'
export const mediumBlack = 'rgb(16, 15, 17)'
export const baseBlack = 'rgb(33, 30, 34)'
export const borderGrey = 'rgb(62, 62, 62)'
export const black065 = 'rgba(0, 0, 0, 0.65)'
export const greyDark = 'rgb(36, 36, 36)'
export const white = 'rgb(255, 255, 255)'
export const gray151 = 'rgb(151,151,151)'
export const white021 = 'rgba(255, 255, 255, 0.21)'
export const white050 = 'rgba(255, 255, 255, 0.5)'
export const white040 = 'rgba(255, 255, 255, 0.4)'
export const white080 = 'rgba(255, 255, 255, 0.8)'
export const blackMain = 'rgb(5, 5, 13)'
export const blackMain030 = 'rgba(5, 5, 13, 0.3)'
export const blackMain040 = 'rgba(5, 5, 13, 0.4)'
export const blackMain050 = 'rgba(5, 5, 13, 0.5)'
export const sand = 'rgb(255, 222, 188)'
export const sand025 = 'rgba(255, 222, 188, 0.25)'
export const sand090 = 'rgb(255, 222, 188, 0.9)'
export const sandLight = 'rgb(255, 239, 223)'
export const sandLight040 = 'rgba(255, 239, 223)'
export const sandLight006 = 'rgba(255, 239, 223, 0.06)'
export const sandLight070 = 'rgba(255, 239, 223, 0.7)'
export const sandLight080 = 'rgba(255, 239, 223, 0.8)'
export const purpleMain = 'rgb(148, 47, 81)'
export const joloColor = 'rgb(197, 41, 105)'
export const purpleMain040 = 'rgba(148, 47, 81, 0.4)'
export const lightGreyLightest = 'rgb(250, 250, 250)'
export const lightGreyLighter = 'rgb(245, 245, 245)'
export const lightGreyLight = 'rgb(242, 242, 242)'
export const lightGrey = 'rgb(236, 236, 236)'
export const greyLighter = 'rgb(155, 155, 158)'
export const greyLight = 'rgb(149, 149, 149)'
export const grey = 'grey' // rgb(128, 128, 128)
export const darkGrey = 'rgb(55, 53, 55)'
export const golden = 'rgb(241, 161, 7)'
export const nativeIosBlue = 'rgb(10, 132, 255)'
export const pink = 'rgb(197, 41, 105)'

export const greenMain = 'rgb(40, 165, 45)'
export const greenFaded060 = 'rgba(233, 239, 221, 0.6)'
export const mint = 'rgb(89, 167, 145)'
export const yellowError = 'rgb(243, 198, 28)'
// PRESETS

export const backgroundDarkMain = blackMain
export const backgroundLightMain = lightGreyLighter
export const dotColorActive = sand
export const dotColorInactive = 'rgba(255, 254, 252, 0.7)'
export const spinnerColor = sand090
export const disabledButtonBackground = lightGrey
export const disabledButtonText = blackMain030
export const backUpWarningBg = golden
export const validTextValid = greenMain

export const navHeaderTintDefault = isAndroid ? white : black
export const navHeaderBgDefault = isAndroid ? black : lightGreyLighter
export const bottomTabBarBg = '#0B030D'

// INTERMEDIATE VERSION COLORS
export const iBackgroundWhite = 'rgb(245, 245, 245)'
export const iTextBlack = 'rgb(48, 48, 48)'
export const iGrey = 'rgb(224, 224, 224)'
export const iLightGrey = 'rgb(208, 208, 208)'
export const iJoloColor = 'rgb(149, 46, 83)'
export const iInputBlack = '#838383'
export const iBorderGray = 'rgba(143, 146, 161, 0.2)'
