import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  TextStyle,
  ViewStyle,
  Platform,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { Colors } from '../colors'
import { Fonts } from '../utils/fonts'

export enum BtnTypes {
  primary,
  secondary,
  tertiary,
}

export enum BtnSize {
  large,
  medium,
}

interface BtnPropsI {
  type?: BtnTypes
  customTextStyles?: TextStyle
  size?: BtnSize
}

interface PropsI extends BtnPropsI {
  size?: BtnSize
  onPress: () => void
  disabled?: boolean

  customContainerStyles?: ViewStyle
}

const GRADIENT_START = { x: 0, y: 0 }
const GRADIENT_END = { x: 1, y: 0 }

const Button: React.FC<BtnPropsI> = ({
  type = BtnTypes.primary,
  size = BtnSize.medium,
  children,
  customTextStyles = {},
}) => {
  return (
    <Text
      style={[
        styles.text,
        type === BtnTypes.primary
          ? styles.textPrimary
          : type === BtnTypes.secondary
          ? styles.textSecondary
          : styles.textTertiary,
        { fontSize: size === BtnSize.medium ? 18 : 20 },
        customTextStyles,
      ]}
    >
      {children}
    </Text>
  )
}

const Btn: React.FC<PropsI> = props => {
  const containerStyles = [styles.container, props.disabled && styles.disabled]
  const btnStyle =
    props.size === BtnSize.large ? styles.largeBtn : styles.mediumBtn

  return (
    <TouchableOpacity
      style={[containerStyles]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      {props.type === BtnTypes.primary ? (
        <LinearGradient
          testID="gradient"
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={[styles.container, btnStyle]}
          colors={[Colors.disco, Colors.ceriseRed]}
        >
          <Button {...props} />
        </LinearGradient>
      ) : (
        <View
          style={[containerStyles, props.customContainerStyles, btnStyle]}
          testID="non-gradient"
        >
          <Button {...props} />
        </View>
      )}
    </TouchableOpacity>
  )
}

Btn.defaultProps = {
  type: BtnTypes.primary,
  size: BtnSize.medium,
  disabled: false,
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeBtn: {
    height: 56,
  },
  mediumBtn: {
    height: 45,
  },
  btn: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.white,
    textAlignVertical: 'center',
    paddingTop: Platform.select({
      ios: 5,
      android: 0,
    }),
  },
  textPrimary: {
    fontFamily: Fonts.Medium,
  },
  textSecondary: {
    fontFamily: Fonts.Regular,
    opacity: 0.8,
  },
  textTertiary: {
    fontFamily: Fonts.Medium,
  },
})

export default Btn
