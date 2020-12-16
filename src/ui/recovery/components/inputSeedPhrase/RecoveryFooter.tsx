import React, { memo } from 'react'
import { Animated, Platform, StyleSheet } from 'react-native'
import I18n from 'i18n-js'

import Suggestions from './SeedKeySuggestions'
import useAnimateRecoveryFooter from './useAnimateRecoveryFooter'
import { useRecoveryState } from './module/recoveryContext'
import { useKeyboard } from './useKeyboard'
import strings from 'src/locales/strings'
import AbsoluteBottom from 'src/ui/deviceauth/components/AbsoluteBottom'
import BtnGroup from './components/BtnGroup'
import Btn, { BtnTypes } from 'src/ui/deviceauth/components/Btn'

interface RecoveryFooterI {
  areSuggestionsVisible: boolean
  handlePhraseSubmit: () => void
  handleCancel: () => void
  isPhraseComplete: boolean
}

const RecoveryFooter: React.FC<RecoveryFooterI> = memo(
  ({
    areSuggestionsVisible,
    handlePhraseSubmit,
    isPhraseComplete,
    handleCancel,
  }) => {
    const { animatedBtns, animatedSuggestions } = useAnimateRecoveryFooter()
    const { keyboardHeight } = useKeyboard()

    return (
      <>
        {Platform.OS === 'android' && areSuggestionsVisible && (
          <AbsoluteBottom
            customStyles={{
              bottom: keyboardHeight + 10,
            }}>
            <Animated.View
              style={[styles.footer, { opacity: animatedSuggestions }]}>
              <Suggestions />
            </Animated.View>
          </AbsoluteBottom>
        )}

        {/* don't use AbsoluteBottom component here it disables buttons on Android */}
        <Animated.View style={{ width: '100%', opacity: animatedBtns }}>
          <BtnGroup>
            <Btn onPress={handlePhraseSubmit} disabled={!isPhraseComplete}>
              {I18n.t(strings.RESTORE_ACCOUNT)}
            </Btn>
            <Btn type={BtnTypes.secondary} onPress={handleCancel}>
              {I18n.t(strings.GO_BACK)}
            </Btn>
          </BtnGroup>
        </Animated.View>
      </>
    )
  },
)

const styles = StyleSheet.create({
  footer: {
    width: '100%',
  },
})

export default function({ onSubmit, onCancel }) {
  const { phrase, areSuggestionsVisible } = useRecoveryState()
  const isPhraseComplete = phrase.length === 12

  return (
    <RecoveryFooter
      areSuggestionsVisible={areSuggestionsVisible}
      handlePhraseSubmit={() => onSubmit(phrase)}
      handleCancel={onCancel}
      isPhraseComplete={isPhraseComplete}
    />
  )
}
