import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { IssuerCard } from 'src/ui/documents/components/issuerCard'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { DecoratedClaims } from 'src/reducers/account'
import { prepareLabel } from 'src/lib/util'

interface Props {
  document: DecoratedClaims
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
  },
  sectionHeader: {
    marginTop: 20,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    color: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    marginBottom: 10,
    paddingLeft: 16,
  },
  claimsContainer: {
    borderTopWidth: 1,
    borderColor: '#ececec',
  },
  claimCard: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ececec',
  },
  claimCardTextContainer: {
    paddingHorizontal: 30,
  },
  claimCardTitle: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

export const DocumentDetails: React.SFC<Props> = ({
  document,
}): JSX.Element => (
  <View style={styles.container}>
    <Text style={styles.sectionHeader}>Issued by</Text>
    <IssuerCard issuer={document.issuer} />

    <Text style={styles.sectionHeader}>Details</Text>
    <View style={styles.claimsContainer}>
      {Object.keys(document.claimData).map(key => (
        <View key={key} style={styles.claimCard}>
          <View style={styles.claimCardTextContainer}>
            <Text style={styles.claimCardTitle}>{prepareLabel(key)}</Text>
            <Text style={JolocomTheme.textStyles.light.textDisplayField}>
              {document.claimData[key]}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
)
