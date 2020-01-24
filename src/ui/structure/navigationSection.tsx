import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { styles } from '../errors/styles'
import { BackIcon, CrossIcon } from '../../resources'

interface Props {
  onNavigation: () => void
  isBackButton: boolean
  isDark?: boolean
}

export const NavigationSection = (props: Props) => {
  const { onNavigation, isBackButton, isDark } = props
  return (
    <View
      style={{
        ...styles.navigationWrapper,
      }}
    >
      {isBackButton ? (
        <TouchableOpacity
          onPress={onNavigation}
          activeOpacity={0.8}
          style={styles.navigationButton}
        >
          <BackIcon dark={isDark} />
        </TouchableOpacity>
      ) : (
        <View />
      )}
      {!isBackButton ? (
        <TouchableOpacity
          onPress={onNavigation}
          activeOpacity={0.8}
          style={styles.navigationButton}
        >
          <CrossIcon dark={isDark} />
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  )
}
