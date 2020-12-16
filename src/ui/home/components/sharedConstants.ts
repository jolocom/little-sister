import { StyleSheet } from 'react-native'
import { Spacing } from 'src/styles'

export const credentialStyles = StyleSheet.create({
  claimsArea: {
    flex: 1,
    marginLeft: Spacing.MD,
  },
  rightIconArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    padding: Spacing.MD,
  },
})
