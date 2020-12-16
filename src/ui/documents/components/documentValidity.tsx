import React from 'react'
import { compareDates } from 'src/lib/util'
import { Text, Image, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Spacing, Typography } from 'src/styles'
import strings from 'src/locales/strings'
import I18n from 'src/locales/i18n'
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
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    marginLeft: Spacing.XXS,
  },
})

export const DocumentValiditySummary: React.FC<Props> = (
  props,
): JSX.Element => {
  const isValid = compareDates(new Date(Date.now()), props.expires) > 1
  return isValid ? (
    <View style={styles.validityContainer}>
      <Icon size={17} name="check-all" color={props.color} />
      <Text style={[styles.validityText, { color: props.color }]}>
        {`${I18n.t(strings.VALID_UNTIL)} ${props.expires.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  ) : (
    <View style={styles.validityContainer}>
      <Image source={expiredIcon} style={{ width: 17, height: 17 }} />
      <Text style={[styles.validityText, { color: props.color }]}>
        {`${I18n.t(strings.EXPIRES_ON)} ${props.expires.toLocaleDateString('en-gb')}`}
      </Text>
    </View>
  )
}
