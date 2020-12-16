import React from 'react'
import { ActionSheet } from './actionSheet'
import I18n from 'src/locales/i18n'
import { View, StyleSheet } from 'react-native'
import { JolocomButton } from './'
import strings from 'src/locales/strings'
import { fontMedium } from 'src/styles/typography'
import { Colors } from 'src/styles'

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  confirm: {
    flex: 2,
  },
  cancel: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: Colors.iBorderGray,
    marginLeft: 12,
  },
  confirmText: {
    fontFamily: fontMedium,
  },
})

interface Props {
  onConfirm: () => void
  onCancel: () => void
  show?: boolean
  cancelText?: string
  confirmText?: string
  disabledConfirm?: boolean
}

export const ButtonSheet = ({
  show = true,
  onConfirm,
  onCancel,
  disabledConfirm,
  confirmText = strings.CONFIRM,
  cancelText = strings.CANCEL,
}: Props) => {
  return (
    <ActionSheet showSlide={show}>
      <View style={styles.wrapper}>
        <JolocomButton
          textStyle={styles.confirmText}
          containerStyle={styles.confirm}
          disabled={!!disabledConfirm}
          onPress={onConfirm}
          text={I18n.t(confirmText)}
        />
        <JolocomButton
          containerStyle={styles.cancel}
          onPress={onCancel}
          text={I18n.t(cancelText)}
          transparent
        />
      </View>
    </ActionSheet>
  )
}
