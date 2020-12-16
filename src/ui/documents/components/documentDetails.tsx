import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { IssuerCard } from 'src/ui/documents/components/issuerCard'
import { DecoratedClaims } from 'src/reducers/account'
import { prepareLabel } from 'src/lib/util'
import { Typography, Colors, Spacing } from 'src/styles'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'

interface Props {
  document: DecoratedClaims
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.XXL,
  },
  sectionHeader: {
    ...Typography.sectionHeader,
    marginTop: Spacing.LG,
    marginBottom: Spacing.SM,
    paddingHorizontal: Spacing.MD,
  },
  claimsContainer: {
    borderColor: Colors.lightGrey,
    borderTopWidth: 1,
  },
  claimCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightGrey,
    paddingVertical: Spacing.MD,
    borderBottomWidth: 1,
  },
  claimCardTextContainer: {
    paddingHorizontal: Spacing.XL,
  },
  claimCardTitle: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    color: Colors.blackMain040,
  },
  claimCardData: {
    ...Typography.standardText,
    color: Colors.blackMain,
  },
})

export const DocumentDetailsComponent: React.FC<Props> = ({ document }) => {
  if (!document) return null

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{I18n.t(strings.ISSUED_BY)}</Text>
      <IssuerCard issuer={document.issuer} />
      <Text style={styles.sectionHeader}>
        {I18n.t(strings.DOCUMENT_DETAILS_CLAIMS)}
      </Text>
      <View style={styles.claimsContainer}>
        {Object.keys(document.claimData).map(key =>
          document.claimData[key] ? (
            <View key={key} style={styles.claimCard}>
              <View style={styles.claimCardTextContainer}>
                <Text style={styles.claimCardTitle}>{prepareLabel(key)}</Text>
                <Text style={styles.claimCardData}>
                  {document.claimData[key]}
                </Text>
              </View>
            </View>
          ) : null,
        )}
      </View>
    </View>
  )
}
