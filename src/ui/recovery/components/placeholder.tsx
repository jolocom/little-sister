import * as React from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Colors, Typography } from 'src/styles'
const styles = StyleSheet.create({
  selector: {
    width: 109,
    height: 32,
    borderRadius: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: Colors.purpleMain,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 16,
  },
  text: {
    ...Typography.baseFontStyles,
    textAlign: 'center',
    lineHeight: 26,
    color: Colors.sandLight,
    fontSize: Typography.textMD,
    ...Platform.select({
      ios: {
        paddingTop: 3,
      },
    }),
  },
})

interface PlaceholderProps {
  i: number
  onPress: (key: number) => void
  sorting: {}
}

const Placeholder = ({ i, onPress, sorting }: PlaceholderProps) => (
  <TouchableOpacity style={styles.selector} onPress={() => onPress(i)}>
    <Text style={styles.text}>{sorting[i] ? sorting[i] : i + 1 + '.'}</Text>
  </TouchableOpacity>
)

export default Placeholder
