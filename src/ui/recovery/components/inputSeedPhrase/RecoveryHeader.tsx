import React, { memo } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { useRecoveryState } from './module/recoveryContext'
import JoloText, { JoloTextKind, JoloTextWeight } from './components/JoloText'
import ScreenHeader from './components/ScreenHeader'
import { Colors } from 'src/ui/deviceauth/colors'
import { JoloTextSizes } from './utils/fonts'
import BP from './utils/breakpoints'
import strings from 'src/locales/strings'
import I18n from 'i18n-js'

interface RecoveryHeaderI {
  phrase: string[]
  currentWordIdx: number
}

const arePropsEqual = (
  prevProps: RecoveryHeaderI,
  nextProps: RecoveryHeaderI,
) => {
  if (prevProps.currentWordIdx !== nextProps.currentWordIdx) {
    return false
  }
  if (prevProps.phrase.toString() != nextProps.phrase.toString()) {
    return false
  }
  return true
}

const RecoveryHeader: React.FC<RecoveryHeaderI> = memo(
  ({ phrase, currentWordIdx }) => {
    return (
      <View style={styles.header}>
        {phrase.length ? (
          <>
            <JoloText kind={JoloTextKind.title} size={JoloTextSizes.middle}>
              {currentWordIdx === phrase.length
                ? phrase.length
                : currentWordIdx + 1}
              /12
            </JoloText>
            <View style={styles.seedPhraseContainer}>
              {phrase.map((seedKey: string, idx: number) => (
                <JoloText
                  kind={JoloTextKind.title}
                  size={JoloTextSizes.middle}
                  weight={JoloTextWeight.regular}
                  key={seedKey + idx}
                  color={
                    currentWordIdx === 12
                      ? Colors.success
                      : idx === currentWordIdx
                      ? Colors.white
                      : Colors.activity
                  }
                  customStyles={{
                    marginHorizontal: 3,
                    ...Platform.select({
                      ios: {
                        lineHeight: BP({
                          default: 26,
                          xsmall: 22,
                        }),
                      },
                    }),
                  }}>
                  {seedKey}
                </JoloText>
              ))}
            </View>
          </>
        ) : (
          <View
            style={{
              ...Platform.select({
                android: {
                  paddingBottom: BP({
                    default: 79,
                    xsmall: 44,
                  }),
                },
              }),
            }}>
            <ScreenHeader
              title={I18n.t(strings.RECOVERY)}
              subtitle={I18n.t(
                strings.START_WRITING_YOUR_SEED_PHRASE_AND_IT_WILL_APPEAR_HERE_WORD_BY_WORD,
              )}
            />
          </View>
        )}
      </View>
    )
  },
  arePropsEqual,
)

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    width: '100%',
  },
  seedPhraseContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    ...Platform.select({
      android: {
        height: BP({ default: 137, xsmall: 97 }),
      },
    }),
  },
})

export default function() {
  const { phrase, currentWordIdx } = useRecoveryState()

  return <RecoveryHeader phrase={phrase} currentWordIdx={currentWordIdx} />
}
