import { Platform, StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Typography } from '../../../styles'
import React from 'react'
import SettingItem from './settingItem'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'

const styles = StyleSheet.create({
  languageOptions: {
    flexDirection: 'row',
    marginTop: Spacing.SM,
  },
  languageOption: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGreyLight,
    borderRadius: 4,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.XS,
    marginRight: Spacing.MD,
  },
  languageOptionText: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    color: Colors.blackMain,
    ...Platform.select({
      ios: {
        paddingTop: 5,
      },
    }),
  },
})

interface Props {
  locales: string[]
  currentLocale: string
  setLocale: (key: string) => void
}

export const LocaleSetting: React.FC<Props> = props => {
  const { currentLocale, setLocale } = props
  return (
    <SettingItem
      title={I18n.translate(strings.LANGUAGE)}
      iconName={'translate'}>
      <View style={styles.languageOptions}>
        {props.locales.map(locale => {
          const isCurrentLanguage = locale === currentLocale
          return (
            <View
              key={locale}
              onTouchEnd={() => setLocale(locale)}
              style={[
                styles.languageOption,
                isCurrentLanguage && {
                  backgroundColor: Colors.sandLight,
                },
              ]}>
              <Text
                style={[
                  styles.languageOptionText,
                  isCurrentLanguage && {
                    color: Colors.purpleMain,
                  },
                ]}>
                {locale.toUpperCase()}
              </Text>
            </View>
          )
        })}
      </View>
    </SettingItem>
  )
}
