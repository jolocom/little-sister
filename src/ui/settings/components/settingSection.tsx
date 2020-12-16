import React, { ReactNodeArray, ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Spacing, Typography } from '../../../styles'

const styles = StyleSheet.create({
  topSection: {
    paddingTop: Spacing.XL,
  },
  sectionHeader: {
    ...Typography.sectionHeader,
    marginLeft: Spacing.MD,
    marginBottom: Spacing.XS,
  },
})

interface Props {
  title: string
  children?: ReactNodeArray | ReactNode
}

export const SettingSection: React.FC<Props> = props => (
  <View style={styles.topSection}>
    <Text style={styles.sectionHeader}>{props.title}</Text>
    {props.children}
  </View>
)
