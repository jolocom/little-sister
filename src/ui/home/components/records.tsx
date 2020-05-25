import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Wrapper } from 'src/ui/structure'
import I18n from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Typography, Colors } from 'src/styles'

interface Props {}

const styles = StyleSheet.create({
  text: {
    ...Typography.mainText,
    textAlign: 'center',
    color: Colors.greyLight,
    paddingHorizontal: '5%',
  },
})

export const RecordsComponent: React.FC<Props> = () => (
  <Wrapper>
    <Text style={styles.text}>
      {I18n.t(strings.YOU_HAVENT_LOGGED_IN_TO_ANY_SERVICES_YET) + '.'}
    </Text>
  </Wrapper>
)
