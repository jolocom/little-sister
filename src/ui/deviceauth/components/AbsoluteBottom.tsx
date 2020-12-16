import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface PropsI {
  customStyles?: ViewStyle
}

const AbsoluteBottom: React.FC<PropsI> = ({ children, customStyles }) => {
  return <View style={[styles.container, customStyles]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
})

export default AbsoluteBottom
