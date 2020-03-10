import * as React from 'react'
import { StyleSheet, Text, TextInput, View, Platform } from 'react-native'
import { JolocomButton, OnlineJolocomButton, Wrapper } from '../../structure'
import { Button } from 'react-native-material-ui'
import { Colors, Spacing, Typography, Buttons } from 'src/styles'
import {
  CheckMarkIcon,
  NextIcon,
  PreviousIcon,
  SpinningIcon,
} from 'src/resources'
import { WordState } from '../container/inputSeedPhrase'
import Rotation from '../../animation/Rotation'
// @ts-ignore
import { RippleLoader } from 'react-native-indicator'
import strings from '../../../locales/strings'
import I18n from 'i18n-js'
import { sandLight } from '../../../styles/colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: Colors.backgroundDarkMain,
  },
  header: {
    ...Typography.largeText,
    color: Colors.sandLight,
    marginTop: Spacing.XL,
  },
  mnemonicSection: {
    flexDirection: 'row',
    height: 130,
    flexWrap: 'wrap',
    marginTop: Spacing.XS,
    justifyContent: 'center',
    marginHorizontal: Spacing.XL,
  },
  note: {
    ...Typography.noteText,
    textAlign: 'center',
    lineHeight: 26,
  },
  mnemonicWord: {
    ...Typography.noteText,
    margin: 2,
    fontSize: 24,
  },
  inputSection: {
    marginHorizontal: Spacing.XL,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: Typography.textLG,
    paddingVertical: 7,
  },
  correct: {
    color: 'white',
  },
  error: {
    color: Colors.purpleMain,
  },
  divider: {
    backgroundColor: Colors.sandLight,
    marginHorizontal: Spacing.XL,
    height: 1,
  },
  hint: {
    fontSize: Typography.textXS,
    color: Colors.white080,
    marginTop: 3,
  },
  wordListWrapper: {
    marginTop: Spacing.LG,
    flexDirection: 'row',
    position: 'relative',
    height: 40,
    width: '100%',
  },
  wordListSection: {
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
    flexWrap: 'nowrap',
    width: '100%',
  },
  buttonSection: {
    flex: 1,
    marginBottom: 30,
    width: '100%',
  },
})
interface InputSeedPhraseProps {
  handleButtonPress: () => void
  handleTextInput: (text: string) => void
  selectWord: (word: string) => void
  inputRef: (ref: TextInput) => void
  handleDoneButton: () => void
  handleBackButton: () => void
  mnemonic: string[]
  inputValue: string
  isMnemonicValid: boolean
  suggestions: string[]
  markedWord: number
  handleNextWord: () => void
  handlePreviousWord: () => void
  inputState: WordState
  isLoading: boolean
}
const InputSeedPhraseComponent: React.FC<InputSeedPhraseProps> = ({
  inputValue,
  markedWord,
  suggestions,
  isMnemonicValid,
  inputState,
  mnemonic,
  handleTextInput,
  selectWord,
  handleButtonPress,
  inputRef,
  handleDoneButton,
  handleNextWord,
  handlePreviousWord,
  handleBackButton,
  isLoading,
}) => {
  const isPreviousEnabled = markedWord > 0 || inputValue.length > 0
  const isNextEnabled = markedWord < mnemonic.length
  let headerText
  if (isLoading) {
    headerText = I18n.t(strings.FULL_PHRASE_VERIFICATION)
  } else if (mnemonic.length === 0) {
    headerText = I18n.t(strings.RECOVERY)
  } else {
    headerText = mnemonic.length + '/12 ' + I18n.t(strings.COMPLETED)
  }
  return (
    <Wrapper
      style={[
        styles.container,
        isLoading && { justifyContent: 'space-around' },
      ]}
    >
      <Text style={styles.header}>{headerText}</Text>
      <View testID="seedPhraseMsg" style={styles.mnemonicSection}>
        {mnemonic.length === 0 ? (
          <Text testID="recoveryMsg" style={styles.note}>
            {I18n.t(
              strings.START_WRITING_YOUR_SEED_PHRASE_AND_IT_WILL_APPEAR_HERE_WORD_BY_WORD,
            )}
          </Text>
        ) : (
          mnemonic.map((word: string, i: number) => (
            <Text
              style={[
                styles.mnemonicWord,
                markedWord === i && { color: Colors.purpleMain },
              ]}
            >
              {word}
            </Text>
          ))
        )}
      </View>
      {!isLoading ? (
        <React.Fragment>
          <View style={styles.inputSection}>
            <View style={{ width: 30 }}>
              {isPreviousEnabled && (
                <PreviousIcon onPress={handlePreviousWord} />
              )}
            </View>
            {/*Placeholder to center text input*/}
            <View style={{ width: 29 }} />
            {
              //@ts-ignore textAlign is missing in the typings of TextInput
              <TextInput
                testID="seedWordFld"
                textAlign={'center'}
                ref={inputRef}
                autoCapitalize={'none'}
                autoCorrect={false}
                style={[
                  styles.textInput,
                  inputState === WordState.wrong
                    ? styles.error
                    : styles.correct,
                ]}
                value={inputValue}
                placeholder={
                  mnemonic.length === 0 ? I18n.t(strings.TAP_HERE) : ''
                }
                placeholderTextColor={Colors.white040}
                onChangeText={handleTextInput}
                returnKeyLabel={I18n.t(strings.DONE)}
                returnKeyType={'next'}
                selectionColor={Colors.purpleMain}
                blurOnSubmit={false}
                onSubmitEditing={handleDoneButton}
              />
            }
            <View style={{ marginRight: 10, width: 19 }}>
              {inputState === WordState.loading && (
                <Rotation>
                  <SpinningIcon />
                </Rotation>
              )}
              {inputState === WordState.valid && <CheckMarkIcon />}
            </View>
            <View style={{ width: 30 }}>
              {isNextEnabled && <NextIcon onPress={handleNextWord} />}
            </View>
          </View>
          <View style={{ width: '100%' }}>
            <View style={styles.divider} />
          </View>
          <Text style={styles.hint}>
            {inputState === WordState.wrong
              ? I18n.t(strings.THE_WORD_IS_NOT_CORRECT_CHECK_FOR_TYPOS)
              : suggestions.length > 0 &&
                I18n.t(strings.CHOOSE_THE_RIGHT_WORD_OR_PRESS_ENTER)}
          </Text>
          <View style={styles.wordListWrapper}>
            <View testID="seedWordSuggestions" style={styles.wordListSection}>
              {inputValue.length > 1 &&
                suggestions.map((word, i) => (
                  <Button
                    testID={'seedSuggestion' + i}
                    key={i}
                    text={word}
                    onPress={() => selectWord(suggestions[i])}
                    upperCase={false}
                    style={{
                      container: {
                        ...Buttons.buttonStandardContainer,
                        minWidth: 0,
                        margin: Spacing.XXS,
                        height: 40,
                        backgroundColor: Colors.purpleMain040,
                      },
                      text: {
                        ...Buttons.buttonStandardText,
                        color: Colors.sandLight,
                        fontSize: Typography.textMD,
                        paddingVertical: Platform.OS === 'ios' ? 12 : 0,
                      },
                    }}
                  />
                ))}
            </View>
          </View>

          <View style={{ flex: 2 }} />
          <View style={styles.buttonSection}>
            {isMnemonicValid && (
              <OnlineJolocomButton
                testID="restoreAccount"
                onPress={handleButtonPress}
                text={I18n.t(strings.RESTORE_ACCOUNT)}
                containerStyle={{
                  marginHorizontal: 30,
                  ...Buttons.buttonStandardContainer,
                }}
                textStyle={Buttons.buttonStandardText}
              />
            )}
            <JolocomButton
              onPress={handleBackButton}
              transparent
              containerStyle={{
                marginTop: 12,
                marginHorizontal: 30,
                borderColor: sandLight,
                ...(!isMnemonicValid && { borderWidth: 1 }),
              }}
              text={I18n.t(strings.BACK_TO_SIGNUP)}
            />
          </View>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <RippleLoader size={120} strokeWidth={4} color={Colors.mint} />
          <View style={{ margin: 20 }} />
        </React.Fragment>
      )}
    </Wrapper>
  )
}

export default InputSeedPhraseComponent
