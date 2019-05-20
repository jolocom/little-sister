import React from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { DocumentCard, Document } from './documentCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface Props {
  documents: Document[]
}

const styles = StyleSheet.create({
  documentContainer: {
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const ExpiredDocumentsOverview: React.SFC<Props> = (
  props,
): JSX.Element => (
  <ScrollView>
    {props.documents.map(document => (
      <View style={styles.documentContainer}>
        <DocumentCard document={document} />
        <Icon size={20} name="chevron-right" color="rgb(209, 209, 214)" />
      </View>
    ))}
  </ScrollView>
)
