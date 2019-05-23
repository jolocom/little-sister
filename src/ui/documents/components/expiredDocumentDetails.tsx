import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { DocumentCard, Document } from './documentCard'
import { DocumentDetails } from './documentDetails'

interface Props {
  document: Document
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  documentCardContainer: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export const ExpiredDocumentsDetailsComponent: React.SFC<Props> = ({
  document,
}): JSX.Element => (
  <View style={styles.container}>
    <View style={styles.documentCardContainer}>
      <DocumentCard document={document} />
    </View>
    <ScrollView>
      <DocumentDetails document={document} />
    </ScrollView>
  </View>
)
