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
      <Text style={styles.sectionHeader}>Issued by</Text>
      <IssuerCard issuer={document.issuer} />
      <Text style={styles.sectionHeader}>
        {I18n.t(strings.DOCUMENT_DETAILS_CLAIMS)}
      </Text>
      <View style={styles.claimsContainer}>
        {Object.keys(document.claimData).map(key => {
          const val = document.claimData[key]
          if (!val) return null
          let ret
          if (key == "actions" && val.length > 0) {
            const actions = val[0]
            ret = (
              <View
                onTouchEnd={() => doAction(action)}
                style={styles.claimCardTextContainer}
              >
                <Icon
                  size={24}
                  name={"play"}
                  color={Colors.golden}
                />
                <Text style={styles.claimCardTitle}>{action.name}</Text>
                <Text style={styles.claimCardData}>
                  {action.description}
                </Text>
              </View>
            )
          } else {
            ret = (
              <View style={styles.claimCardTextContainer}>
                <Text style={styles.claimCardTitle}>{prepareLabel(key)}</Text>
                <Text style={styles.claimCardData}>
                  {val.url ? 'WTF' : val}
                </Text>
              </View>
            )
          }
          return (
            <View key={key} style={styles.claimCard}>
            {ret}
            </View>
          )
        })}
      </View>
    </View>
  )
}
