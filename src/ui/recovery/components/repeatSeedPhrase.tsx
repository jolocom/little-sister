import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Container } from '../../structure'
import { JolocomTheme } from '../../../styles/jolocom-theme'
import { Button } from 'react-native-material-ui'
import Placeholder from './placeholder'
import strings from '../../../locales/strings'
import * as I18n from 'i18n-js'

const styles = StyleSheet.create({
  container: {
    backgroundColor: JolocomTheme.primaryColorBlack,
  },
  mainSection: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noteSection: {
    marginTop: 20,
  },
  note: {
    textAlign: 'center',
    lineHeight: 26,
    color: JolocomTheme.primaryColorSand,
    fontSize: JolocomTheme.labelFontSize,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  mnemonicContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginTop: 15,
    height: 40,
  },
  mnemonicPhrase: {
    position: 'absolute',
    flexDirection: 'row',
  },
  mnemonic: {
    marginRight: 7,
    fontSize: 34,
    fontFamily: JolocomTheme.contentFontFamily,
    color: JolocomTheme.primaryColorSandInactive,
  },
  currentWord: {
    color: JolocomTheme.primaryColorWhite,
    position: 'relative',
    alignSelf: 'center',
  },
  wordOrderSection: {
    marginTop: 18,
    flexDirection: 'row',
  },
  buttonSection: {
    marginTop: 'auto',
  },
  buttonContainer: {
    borderRadius: 4,
    height: 48,
    paddingHorizontal: 25,
    backgroundColor: JolocomTheme.primaryColorPurple,
  },
  buttonText: {
    paddingVertical: 15,
    fontWeight: '100',
    fontSize: JolocomTheme.headerFontSize,
    color: JolocomTheme.primaryColorWhite,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

interface RepeatSeedPhraseProps {
  note: string
  mnemonicSorting: {}
  randomWords: string[]
  back: () => void
  checkMnemonic: () => void
  selectPosition: (id: number) => void
}
const RepeatSeedPhraseComponent: React.FC<RepeatSeedPhraseProps> = ({
  note,
  mnemonicSorting,
  randomWords,
  back,
  checkMnemonic,
  selectPosition,
}): JSX.Element => {
  // through trial and error, the average width of a character looks to be about 15 pixels
  // to center the current word, we use half the length to position left of center
  const leftShiftCurrentWord =
    (randomWords && randomWords[0] && randomWords[0].length * 7.5) || 0
  return (
    <Container style={styles.container}>
      <View style={styles.mainSection}>
        <View style={styles.noteSection}>
          <Text style={styles.note}>{note}</Text>
        </View>
        <View style={styles.mnemonicContainer}>
          <View
            style={[styles.mnemonicPhrase, { left: -leftShiftCurrentWord }]}
          >
            {randomWords.map((key, i) => (
              <Text
                key={key}
                style={[styles.mnemonic, i === 0 && styles.currentWord]}
              >
                {key}
              </Text>
            ))}
            {/* PLACEHOLDER */}
            <Text style={[styles.mnemonic, { color: 'black' }]}>I</Text>
          </View>
        </View>
        <View style={styles.wordOrderSection}>
          <View>
            {new Array(6).fill('').map((e, i) => (
              <Placeholder
                key={i}
                i={i}
                sorting={mnemonicSorting}
                onPress={selectPosition}
              />
            ))}
          </View>
          <View>
            {new Array(6).fill('').map((e, i) => (
              <Placeholder
                key={i}
                i={i + 6}
                sorting={mnemonicSorting}
                onPress={selectPosition}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.buttonSection}>
        <Button
          style={{ container: styles.buttonContainer, text: styles.buttonText }}
          onPress={randomWords.length ? back : checkMnemonic}
          raised
          upperCase={false}
          text={
            randomWords.length
              ? I18n.t(strings.SHOW_MY_PHRASE_AGAIN)
              : I18n.t(strings.CONFIRM_AND_CHECK)
          }
        />
      </View>
    </Container>
  )
}

export default RepeatSeedPhraseComponent
