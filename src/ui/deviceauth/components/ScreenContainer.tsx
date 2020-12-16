import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Colors } from '../colors'
import { ViewStyle } from 'react-native-material-ui'

interface PropsI {
  customStyles?: ViewStyle
}

const ScreenContainer: React.FC<PropsI> = ({ children, customStyles }) => {
  return <View style={[styles.container, customStyles]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mainBlack,
    paddingTop: 50,
  },
})

export default ScreenContainer
