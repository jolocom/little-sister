import { TabScene } from 'react-navigation'
import React from 'react'
import {
  AccessibilityRole,
  AccessibilityState,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { fontLight } from '../../../styles/typography'
import { BP } from '../../../styles/breakpoints'
import I18n from 'src/locales/i18n'

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: BP({
      small: 10,
      medium: 12,
      large: 13,
    }),
    fontFamily: fontLight,
    marginTop: 5,
  },
  button: {
    zIndex: 4,
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

interface Props {
  testID: string
  scene: TabScene
  renderIcon: (scene: TabScene) => React.ReactNode
  onTabPress: () => void
  label: string
  accessibility: {
    label: string
    role: AccessibilityRole
    states: AccessibilityState[]
  }
  colors: {
    activeTintColor: string
    inactiveTintColor: string
  }
}

export const TabButton = (props: Props) => {
  const {
    scene,
    renderIcon,
    onTabPress,
    label,
    testID,
    accessibility,
    colors,
  } = props

  const iconSize = BP({
    small: 18,
    medium: 20,
    large: 21,
  })

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onTabPress}
      onLongPress={onTabPress}
      style={styles.button}
      accessibilityLabel={accessibility.label}
      accessibilityRole={accessibility.role}
      accessibilityStates={accessibility.states}
    >
      <View style={{ width: iconSize, height: iconSize }}>
        {renderIcon({
          ...scene,
          tintColor: scene.focused
            ? colors.activeTintColor
            : colors.inactiveTintColor,
        })}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: scene.focused
              ? colors.activeTintColor
              : colors.inactiveTintColor,
          },
        ]}
        allowFontScaling={true}
      >
        {I18n.t(label)}
      </Text>
    </TouchableOpacity>
  )
}
