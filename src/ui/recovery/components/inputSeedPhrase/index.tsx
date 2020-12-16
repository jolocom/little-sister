import React from 'react'
import {
  ScrollView,
  View,
  StyleSheet,
  InputAccessoryView,
  Platform,
} from 'react-native'

// @ts-ignore
import { RippleLoader } from 'react-native-indicator'

import { Colors } from 'src/styles'

import RecoveryHeader from './RecoveryHeader'
import RecoveryFooter from './RecoveryFooter'

import SeedKeyInput from './SeedKeyInput'
import SeedKeySuggestions from './SeedKeySuggestions'
import ScreenContainer from 'src/ui/deviceauth/components/ScreenContainer'

interface Props {
  handleSubmit: (mnemonic: string[]) => void
  handleCancel: () => void
  isLoading: boolean
}

const Recovery: React.FC<Props> = ({
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <ScreenContainer>
        <RippleLoader size={120} strokeWidth={4} color={Colors.mint} />
      </ScreenContainer>
    )
  }
  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
        scrollEnabled={false} // to prevent pulling up and down the screen
      >
        <ScreenContainer
          customStyles={{
            justifyContent: 'space-between',
            paddingHorizontal: '5%',
          }}>
          <View style={styles.headerContainer}>
            <RecoveryHeader />
            <SeedKeyInput />
          </View>
          <RecoveryFooter onSubmit={handleSubmit} onCancel={handleCancel} />
        </ScreenContainer>
      </ScrollView>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="suggestions">
          <View style={{ marginBottom: 10, marginLeft: 10 }}>
            <SeedKeySuggestions />
          </View>
        </InputAccessoryView>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    width: '100%',
  },
})

export default Recovery
