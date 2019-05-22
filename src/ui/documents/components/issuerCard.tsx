import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: JolocomTheme.primaryColorWhite,
    paddingVertical: 18,
    paddingLeft: 15,
    paddingRight: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ececec',
  },
  icon: {
    width: 42,
    height: 42,
  },
  textContainer: {
    marginLeft: 16,
  },
  text: {
    fontSize: 17,
    color: JolocomTheme.primaryColorPurple,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

export const IssuerCard = ({ issuer }: { issuer: string }): JSX.Element => {
  return (
    <View style={styles.container}>
      {/* TODO: Add support for icon */}
      <View style={styles.textContainer}>
        <Text
          style={JolocomTheme.textStyles.light.textDisplayField}
          numberOfLines={1}
        >
          {I18n.t('Name of issuer')}
        </Text>
        <Text style={styles.text} numberOfLines={1}>
          {issuer}
        </Text>
      </View>
    </View>
  )
}
