import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { IssuerCard } from 'src/ui/documents/components/issuerCard'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Document } from './documentCard'

interface Props {
  document: Document
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
    {Object.keys(document.details).map(key => (
      <View key={key} style={styles.claimCard}>
        <View style={styles.claimCardTextContainer}>
          {/* TODO: Capitalize key? */}
          <Text style={styles.claimCardTitle}>{key}</Text>
          <Text style={JolocomTheme.textStyles.light.textDisplayField}>
            {document.details[key]}
          </Text>
        </View>
      </View>
    ))}
  </View>
)
