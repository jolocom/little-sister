import React from 'react'
import { View, StyleSheet } from 'react-native'
import Header from './components/Header'

const PasscodeHeader: React.FC = ({ children }) => (
  <View style={styles.headerContainer}>
    <Header>{children}</Header>
  </View>
)

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
})

export default PasscodeHeader
