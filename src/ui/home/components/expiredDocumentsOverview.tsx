import React from 'react'
import { ScrollView } from 'react-native'
import { DocumentCard, Document } from './documentCard'

interface Props {
  documents: Document[]
}

export const ExpiredDocumentsOverview: React.SFC<Props> = (
  props,
): JSX.Element => (
  <ScrollView style={{ width: '100%' }}>
    {props.documents.map(document => (
      <DocumentCard document={document} />
    ))}
  </ScrollView>
)
