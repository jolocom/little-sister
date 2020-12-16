import React from 'react'
import { Text, View, ViewStyle } from 'react-native'
import { styles } from '../styles'

interface Props {
  title: string
  style?: ViewStyle
}

export const SectionWrapper: React.FC<Props> = props => {
  const { title, style: propStyle, children } = props
  return (
    <View style={[styles.sectionWrapper, propStyle]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}
