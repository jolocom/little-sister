import React, { FC } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'
import { Colors, Spacing } from '../../../styles'
import {
  centeredText,
  fontLight,
  fontMain,
  textSM,
  textXL,
  textXS,
} from '../../../styles/typography'

const styles = StyleSheet.create({
  notAuthorizedOverlay: {
    alignItems: 'center',
    zIndex: 1,
    justifyContent: 'flex-start',
  },
  scanText: {
    color: Colors.sandLight,
    fontSize: textXL,
    fontFamily: fontMain,
    ...centeredText,
  },
  notAuthorizedDescription: {
    color: Colors.white,
    fontSize: textSM,
    width: 260,
    marginTop: Spacing.XS,
    fontFamily: fontLight,
    lineHeight: 24,
    ...centeredText,
  },
  enableButtonWrapper: {
    marginTop: Spacing.XXL,
  },
  enableButtonText: {
    fontSize: textXS,
    fontFamily: fontMain,
    lineHeight: 20,
    color: Platform.select({
      android: Colors.pink,
      ios: Colors.nativeIosBlue,
    }),
    textDecorationLine: Platform.select({
      android: 'underline',
      ios: 'none',
    }),
    ...centeredText,
  },
})

interface Props {
  onPressEnable: () => void
}

export const NoPermissionComponent: FC<Props> = (props: Props) => (
  <React.Fragment>
    <View style={styles.notAuthorizedOverlay}>
      <Text style={styles.scanText}>{I18n.t(strings.SCAN_QR)}</Text>
      <Text style={styles.notAuthorizedDescription}>
        {I18n.t(
          strings.ENABLE_ACCESS_SO_YOU_CAN_START_TAKING_PHOTOS_AND_VIDEOS,
        )}
      </Text>
      <TouchableOpacity
        style={styles.enableButtonWrapper}
        onPress={props.onPressEnable}>
        <Text style={styles.enableButtonText}>
          {Platform.select({
            android: I18n.t(strings.ENABLE_CAMERA_ACCESS),
            ios: I18n.t(strings.REQUEST_PERMISSION),
          })}
        </Text>
      </TouchableOpacity>
    </View>
  </React.Fragment>
)
