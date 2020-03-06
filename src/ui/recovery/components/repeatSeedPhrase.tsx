import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Wrapper, JolocomButton } from '../../structure'
import Placeholder from './placeholder'
import strings from '../../../locales/strings'
import * as I18n from 'i18n-js'
import { Colors, Spacing, Typography } from '../../../styles'

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '5%',
  },
  mainSection: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  noteSection: {
    marginHorizontal: Spacing.LG,
  },
  note: {
    ...Typography.centeredText,
    ...Typography.noteText,
  },
  mnemonicContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginTop: Spacing.MD,
    height: 40,
  },
  mnemonicPhrase: {
    position: 'absolute',
    flexDirection: 'row',
  },
  mnemonic: {
    ...Typography.largeText,
    color: Colors.white050,
    marginRight: Spacing.XS,
  },
  currentWord: {
    color: Colors.white,
    position: 'relative',
    alignSelf: 'center',
  },
  wordOrderSection: {
    marginTop: 18,
    flexDirection: 'row',
  },
  buttonSection: {
    marginTop: 'auto',
    marginBottom: 30,
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
    <Wrapper dark centered>
      <View style={styles.container}>
        <View style={styles.mainSection}>
          <View style={styles.noteSection}>
            <Text style={styles.note}>{note}</Text>
          </View>
          <View style={styles.mnemonicContainer}>
            <View
              style={[styles.mnemonicPhrase, { left: -leftShiftCurrentWord }]}>
              {randomWords.map((key, i) => (
                <Text
                  key={key}
                  style={[styles.mnemonic, i === 0 && styles.currentWord]}>
                  {key}
                </Text>
              ))}
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
          <JolocomButton
            onPress={randomWords.length ? back : checkMnemonic}
            containerStyle={{ height: 56 }}
            text={
              randomWords.length
                ? I18n.t(strings.SHOW_MY_PHRASE_AGAIN)
                : I18n.t(strings.CONFIRM_AND_CHECK)
            }
          />
        </View>
      </View>
    </Wrapper>
  )
}

export default RepeatSeedPhraseComponent
