import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { DocumentCard } from './documentCard'
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DecoratedClaims } from 'src/reducers/account'
import { Spacing } from 'src/styles'

interface DocumentsListProps {
  onDocumentPress?: (document: DecoratedClaims) => void
  documents: DecoratedClaims[]
}

const styles = StyleSheet.create({
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.MD,
    paddingBottom: Spacing.XL,
  },
})

export const DocumentsList: React.SFC<DocumentsListProps> = (
  props,
): JSX.Element => (
  <React.Fragment>
    {props.documents.map((document, idx) => {
      const { credentialType, renderInfo, claimData, expires } = document
      return (
        <TouchableOpacity
          key={idx}
          delayPressIn={5}
          style={styles.documentContainer}
          onPress={() =>
            props.onDocumentPress && props.onDocumentPress(document)
          }
        >
          <DocumentCard
            credentialType={credentialType}
            renderInfo={renderInfo}
            claimData={claimData}
            expires={expires}
          />
          {/* <Icon size={20} name="chevron-right" color="rgb(209, 209, 214)" /> */}
        </TouchableOpacity>
      )
    })}
  </React.Fragment>
)
