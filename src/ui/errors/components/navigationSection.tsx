import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { styles } from '../styles'
import { BackIcon, CrossIcon } from '../../../resources'
import { Colors } from 'src/ui/deviceauth/colors'

interface Props {
  onNavigation: () => void
  isBackButton: boolean
  backButtonColor?: Colors
}

export const NavigationSection = (props: Props) => {
  const { onNavigation, isBackButton, backButtonColor } = props
  return (
    <View
      style={{
        ...styles.navigationWrapper,
      }}>
      {isBackButton ? (
        <TouchableOpacity
          onPress={onNavigation}
          activeOpacity={0.8}
          style={styles.navigationButton}>
          <BackIcon color={backButtonColor} />
        </TouchableOpacity>
      ) : (
        <View />
      )}
      {!isBackButton ? (
        <TouchableOpacity
          onPress={onNavigation}
          activeOpacity={0.8}
          style={styles.navigationButton}>
          <CrossIcon />
        </TouchableOpacity>
      ) : (
        <View />
      )}
    </View>
  )
}
