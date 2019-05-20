import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export interface Document {
  details: {
    type: string
    id_number: string
    [key: string]: string
  }
  valid_until: Date | undefined
  issuer: string
}

interface DocumentCardProps {
  document: Document
}

const styles = StyleSheet.create({
  card: {
    height: 176,
    backgroundColor: JolocomTheme.primaryColorSand,
    borderColor: 'rgb(233, 233, 233)',
    borderWidth: 1,
    borderRadius: 10,
    width: 276,
    paddingVertical: 16,
  },
  documentType: {
    paddingHorizontal: 15,
    fontSize: 28,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  documentNumber: {
    paddingHorizontal: 15,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  validityContainer: {
    flexDirection: 'row',
    color: 'red',
    marginTop: 'auto',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
  },
  validityText: {
    marginLeft: 5,
    fontSize: 17,
  },
})

export const DocumentCard: React.SFC<DocumentCardProps> = (
  props,
): JSX.Element => (
  <View style={styles.card}>
    <Text style={styles.documentType}>{props.document.details.type}</Text>
    <Text style={styles.documentNumber}>
      {props.document.details.id_number}
    </Text>
    <View style={styles.validityContainer}>
      <Icon size={17} name="check-all" />
      {props.document.valid_until && (
        <Text style={styles.validityText}>
          Valid until {props.document.valid_until.toLocaleDateString('en-GB')}
        </Text>
      )}
    </View>
  </View>
)

const collapsedDocCardStyles = StyleSheet.create({
  card: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    width: 101,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'grey',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: JolocomTheme.primaryColorGrey,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export const CollapsedDocumentCard = (): JSX.Element => (
  <View style={collapsedDocCardStyles.card}>
    <View style={collapsedDocCardStyles.icon}>
      <Icon size={20} name="checkbox-multiple-blank" />
    </View>
  </View>
)
