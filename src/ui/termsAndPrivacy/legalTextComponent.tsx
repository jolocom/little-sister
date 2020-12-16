import React, { useState } from 'react'
import { ConsentText, ConsentTextButton } from './termsOfServiceConsent'
import { Wrapper } from '../structure'
import { NavigationSection } from '../errors/components/navigationSection'
import { View, Text, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import I18n from 'src/locales/i18n'
import { fontMain } from 'src/styles/typography'
import strings from 'src/locales/strings'

interface Props {
  locale: string
  enText: string
  deText: string
  onBackPress: () => void
  title: string
}

export const LegalTextComponent: React.FC<Props> = ({
  locale,
  title,
  enText,
  deText,
  onBackPress,
}) => {
  const legalText = locale === 'en' ? enText : deText
  const [toggleGerman, setToggleGerman] = useState(false)

  const renderGermanToggle = () => {
    if (locale === 'en') {
      return toggleGerman ? (
        <ConsentText text={deText} onPress={() => setToggleGerman(false)} />
      ) : (
        <ConsentTextButton
          text={I18n.t(strings.DE_VERSION)}
          onPress={() => setToggleGerman(true)}
        />
      )
    }

    return null
  }

  return (
    <Wrapper secondaryDark>
      <NavigationSection onNavigation={onBackPress} isBackButton={true} />
      <View style={styles.wrapper}>
        <Text style={styles.header}>{I18n.t(title)}</Text>
        <ScrollView
          contentContainerStyle={{ paddingBottom: '20%' }}
          showsVerticalScrollIndicator={false}
          overScrollMode="never">
          <Text style={styles.text}>{legalText}</Text>
          {renderGermanToggle()}
        </ScrollView>
      </View>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontFamily: fontMain,
    fontSize: 28,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 32,
    letterSpacing: 0,
    color: 'rgba(255,255,255,0.9)',
    marginVertical: 16,
  },
  text: {
    fontFamily: fontMain,
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0.14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
})
