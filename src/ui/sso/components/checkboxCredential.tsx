import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Spacing, Typography, Colors } from 'src/styles'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  CredentialTypeSummary,
  CredentialVerificationSummary,
} from '@jolocom/sdk/js/interactionManager/types'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import { IconToggle } from 'react-native-material-ui'
import { reject, isEmpty } from 'ramda'
import { IdentitySummary } from '@jolocom/sdk'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: Spacing.SM,
  },
  claimArea: {
    flex: 1,
  },
  rightIconArea: {},
  claimText: {
    ...Typography.cardMainText,
    marginTop: Spacing.XXS,
  },
  issuerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.XXS,
  },
  issuerStatusText: {
    ...Typography.cardSecondaryText,
    marginLeft: Spacing.XXS,
  },
})

interface CheckboxCredentialProps {
  credential: CredentialTypeSummary
  selectedCredential: CredentialVerificationSummary | undefined
  did: string
  isSelected: boolean
  issuer: IdentitySummary
  onPress: () => void
}

/**
 * CheckboxCredential takes a credential and displays the values of its claims
 * (without titles) with a checkbox for selection. This is used as part of the
 * CredentialSectionCard component on the share credentials (consent) interaction
 * screen.
 */

export const CheckboxCredential: React.FC<CheckboxCredentialProps> = props => {
  const { credential, did, issuer, isSelected, onPress } = props
  const { values } = credential
  const selfSigned = did === issuer.did
  const status = { color: selfSigned ? Colors.blackMain040 : Colors.greenMain }

  return (
    <View style={styles.container}>
      <View style={styles.claimArea}>
        {reject(isEmpty, values).map(value => (
          <Text style={styles.claimText}>{value}</Text>
        ))}
        <View style={styles.issuerStatusContainer}>
          <Icon name="check-all" size={Typography.textXS} style={status} />
          <Text style={[styles.issuerStatusText, status]} numberOfLines={1}>
            {selfSigned ? I18n.t(strings.SELF_SIGNED) : issuer.did}
          </Text>
        </View>
      </View>

      <View style={styles.rightIconArea}>
        <IconToggle
          name={isSelected ? 'check-circle' : 'fiber-manual-record'}
          color={isSelected ? Colors.purpleMain : Colors.lightGrey}
          onPress={onPress}
        />
      </View>
    </View>
  )
}
