import React from 'react'
import { StyleSheet, View } from 'react-native'

export enum BtnsAlignment {
  vertical,
  horizontal,
}

interface PropsI {
  alignment?: BtnsAlignment
}

const BtnGroup: React.FC<PropsI> = ({
  alignment = BtnsAlignment.vertical,
  children,
}) => {
  return (
    <View
      style={[
        styles.container,
        alignment === BtnsAlignment.horizontal && styles.horizontal,
      ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 30,
  },
  horizontal: {
    flexDirection: 'row',
  },
})

export default BtnGroup
