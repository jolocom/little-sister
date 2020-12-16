import { Dimensions } from 'react-native'

const SCREEN_SIZE = Dimensions.get('window')

enum ScreenSize {
  xsmall = 'xsmall',
  small = 'small',
  medium = 'medium',
  large = 'large',
}

interface StyleValues<T extends string | number> {
  default?: never
  [ScreenSize.xsmall]: T
  [ScreenSize.small]: T
  [ScreenSize.medium]: T
  [ScreenSize.large]: T
}

interface DefaultedStyleValues<T extends string | number> {
  default: T
  [ScreenSize.xsmall]?: T
  [ScreenSize.small]?: T
  [ScreenSize.medium]?: T
  [ScreenSize.large]?: T
}

interface Breakpoint {
  width: number
  height: number
}

const breakpoints: Record<string, Breakpoint> = {
  large: {
    width: 414,
    height: 814,
  },
  medium: {
    width: 380,
    height: 700,
  },
  small: {
    width: 360,
    height: 640,
  },
}

const isBreakpoint = (breakpointSize: ScreenSize) => {
  return SCREEN_SIZE.height >= breakpoints[breakpointSize].height
}

// NOTE: Maps through the breakpoints (biggest to smallest) and returns the @ScreenSize of the device if it's
// bigger than the breakpoint. In case the map didn't find anything, means the screen is smaller than all the
// breakpoints, returning the smallest @ScreenSize.
const getScreenSize = (): ScreenSize => {
  const size = (Object.keys(breakpoints) as ScreenSize[]).find(isBreakpoint)
  return size ? size : ScreenSize.xsmall
}

const BP = <T extends string | number>(
  values: StyleValues<T> | DefaultedStyleValues<T>,
): T => {
  const value = values[getScreenSize()]
  const isValue = typeof value !== 'undefined'
  const isDefault = typeof values.default !== 'undefined'

  if (!isValue && isDefault) {
    return values.default!
  } else if (!isValue) {
    throw new Error('No breakpoint or default found!')
  } else {
    return value!
  }
}

export default BP
