import React from 'react'
import { compareDates } from 'src/lib/util'
import { Text, Image, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { JolocomTheme } from 'src/styles/jolocom-theme'
const expiredIcon = require('src/resources/img/expired.png')

interface Props {
  expiryDate: Date
}

const styles = StyleSheet.create({
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  validityText: {
    marginLeft: 5,
    fontFamily: JolocomTheme.contentFontFamily,
    fontSize: 17,
  },
})

// TODO: Refactor home/components/validitySummary.tsx so we just use one

export const DocumentValiditySummary: React.SFC<Props> = (
  props,
): JSX.Element => {
  const isValid = compareDates(new Date(Date.now()), props.expiryDate) > 1
  return isValid ? (
    <View style={styles.validityContainer}>
      <Icon size={17} name="check-all" />
      <Text style={styles.validityText}>
        {`Valid until ${props.expiryDate.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  ) : (
    <View style={styles.validityContainer}>
      <Image source={expiredIcon} style={{ width: 17, height: 17 }} />
      <Text style={styles.validityText}>
        {`Expired on ${props.expiryDate.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  )
}
