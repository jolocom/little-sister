import React from 'react'
import { CardWrapper } from 'src/ui/structure'
import { getCredentialIconByType } from 'src/resources/util'
import { StyleSheet, View, Text } from 'react-native'
import { Spacing, Typography } from 'src/styles'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import { CheckboxCredential } from './checkboxCredential'
import {
  CredentialTypeSummary,
  CredentialVerificationSummary,
} from '@jolocom/sdk/js/interactionManager/types'

const styles = StyleSheet.create({
  card: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  leftIconSection: {
    paddingHorizontal: Spacing.XS,
  },
  credentialsArea: {
    flex: 1,
    marginLeft: Spacing.LG,
  },
  noClaimsText: {
    ...Typography.cardMainText,
    marginTop: Spacing.SM,
  },
})

interface CredentialSectionProps {
  did: string
  sectionType: string
  credentials: CredentialTypeSummary[]
  selectedCredential: CredentialVerificationSummary | undefined
  onPress: (type: string, newSelected: CredentialVerificationSummary) => void
}

/**
 * CredentialSectionCard takes credentials that have been sorted into a group and
 * render the credentials wrapped in a card. The card displays an icon and title
 * for the group.
 */
export const CredentialSectionCard: React.FC<CredentialSectionProps> = props => {
  const { sectionType, did, credentials, selectedCredential, onPress } = props
  return (
    <CardWrapper style={styles.card}>
      <View style={styles.leftIconSection}>
        {getCredentialIconByType(sectionType)}
      </View>
      <View style={styles.credentialsArea}>
        {/* Title for the section */}
        <Text style={Typography.cardSecondaryTextBlack}>{I18n.t(sectionType)}:</Text>

        {/* Credentials in each section */}
        {credentials.map(credential => {
          const { values, verifications, type } = credential
          const isSelected =
            selectedCredential && selectedCredential.id === verifications[0].id

          return values.length === 0 ? (
            <View>
              <Text style={styles.noClaimsText}>
                {I18n.t(strings.NO_LOCAL_CLAIMS)}
              </Text>
            </View>
          ) : (
            <CheckboxCredential
              selectedCredential={selectedCredential}
              did={did}
              credential={credential}
              isSelected={!!isSelected}
              issuer={(verifications[0] && verifications[0].issuer) || {}}
              onPress={() => onPress(type, verifications[0])}
            />
          )
        })}
      </View>
    </CardWrapper>
  )
}
