import React, { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import I18n from 'i18n-js'

import { useRecoveryState } from './module/recoveryContext'
import { JoloTextSizes } from './utils/fonts'
import JoloText, { JoloTextKind } from './components/JoloText'
import BP from './utils/breakpoints'
import { Colors } from 'src/ui/deviceauth/colors'
import strings from 'src/locales/strings'

interface RecoveryInputMetadataI {
  keyHasError: boolean
}

const RecoveryInputMetadata: React.FC<RecoveryInputMetadataI> = memo(
  ({ keyHasError }) => {
    return (
      <View style={styles.inputMeta}>
        {keyHasError ? (
          <JoloText
            kind={JoloTextKind.subtitle}
            size={JoloTextSizes.middle}
            color={Colors.error}>
            {I18n.t(strings.THE_WORD_IS_NOT_CORRECT_CHECK_FOR_TYPOS)}
          </JoloText>
        ) : null}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  inputMeta: {
    marginTop: BP({ default: 15, xsmall: 7 }),
  },
})

export default function() {
  // extracting only keyHasError property from the context to avoid unnecessary re-renders
  const { keyHasError, suggestedKeys } = useRecoveryState()
  return (
    <RecoveryInputMetadata keyHasError={keyHasError && !suggestedKeys.length} />
  )
}
