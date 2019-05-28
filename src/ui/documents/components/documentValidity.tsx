import React from 'react'
import { compareDates } from 'src/lib/util'
import { Text, Image, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { JolocomTheme } from 'src/styles/jolocom-theme'
const expiredIcon = require('src/resources/img/expired.png')

interface Props {
  expires: Date
  color?: string
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
  const isValid = compareDates(new Date(Date.now()), props.expires) > 1
  return isValid ? (
    <View style={styles.validityContainer}>
      <Icon size={17} name="check-all" color={props.color} />
      <Text style={[styles.validityText, { color: props.color }]}>
        {`Valid until ${props.expires.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  ) : (
    <View style={styles.validityContainer}>
      <Image source={expiredIcon} style={{ width: 17, height: 17 }} />
      <Text style={[styles.validityText, { color: props.color }]}>
        {`Expired on ${props.expires.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  )
}
