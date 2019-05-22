import React from 'react'
import { View } from 'react-native'
import { DocumentCard, Document } from './documentCard'
import { DocumentDetails } from './documentDetails'

interface Props {
  document: Document
}

export const ExpiredDocumentsDetails: React.SFC<Props> = ({
  document,
}): JSX.Element => (
  <View>
    <DocumentCard document={document} />
    <DocumentDetails document={document} />
  </View>
)
