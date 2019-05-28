import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { DocumentCard } from './documentCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DecoratedClaims } from 'src/reducers/account'

interface Props {
  openExpiredDetails: (document: DecoratedClaims) => void
  documents: DecoratedClaims[]
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
      <TouchableOpacity
        style={styles.documentContainer}
        onPress={() => {
          props.openExpiredDetails(document)
        }}
      >
        <DocumentCard document={document} />
        <Icon size={20} name="chevron-right" color="rgb(209, 209, 214)" />
      </TouchableOpacity>
    ))}
  </ScrollView>
)
