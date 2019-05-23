import React from 'react'
import { View, StyleSheet, Text, Image, ImageBackground } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Color } from 'csstype'
import { DocumentValiditySummary } from './documentValidity'

export interface Document {
  details: {
    type: string
    idNumber?: string
    [key: string]: any
  }
  expiryDate: Date | undefined
  issuer: string
  background: {
    color?: Color
    // should be a URL to the image
    image?: string
  }
  // should be a URL to the image
  icon?: string
}

interface DocumentCardProps {
  document: Document
}

const styles = StyleSheet.create({
  card: {
    height: 176,
    backgroundColor: JolocomTheme.primaryColorWhite,
    borderColor: 'rgb(255, 222, 188)',
    borderWidth: 2,
    borderRadius: 10,
    width: 276,
    overflow: 'hidden',
  },
  cardBack: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
  },
  cardContent: {
    paddingVertical: 16,
    flex: 1,
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
    color: 'rgba(5, 5, 13, 0.4)',
  },
  validityContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    alignItems: 'center',
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
  },
  validityText: {
    marginLeft: 5,
    fontSize: 15,
  },
  icon: {
    marginLeft: 'auto',
    width: 42,
    height: 42,
  },
})

export const DocumentCard: React.SFC<DocumentCardProps> = (
  props,
): JSX.Element => (
  <View style={styles.card}>
    <ImageBackground
      style={[
        styles.cardBack,
        {
          backgroundColor: props.document.background.color || 'transparent',
        },
      ]}
      source={{
        uri: props.document.background.image,
      }}
    />
    <View style={styles.cardContent}>
      <Text style={styles.documentType}>{props.document.details.type}</Text>
      <Text style={styles.documentNumber}>
        {props.document.details.idNumber}
      </Text>
      <View style={styles.validityContainer}>
        {props.document.expiryDate && (
          <DocumentValiditySummary expiryDate={props.document.expiryDate} />
        )}
        {props.document.icon ? (
          <Image source={{ uri: props.document.icon }} style={styles.icon} />
        ) : (
          <View style={[styles.icon, { backgroundColor: 'grey' }]} />
        )}
      </View>
    </View>
  </View>
)

const collapsedDocCardStyles = StyleSheet.create({
  card: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    width: 101,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgb(255, 222, 188)',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: JolocomTheme.primaryColorGrey,
    width: 42,
    height: 42,
  },
})

export const CollapsedDocumentCard = ({
  document,
}: {
  document: Document
}): JSX.Element => (
  <View
    style={[
      collapsedDocCardStyles.card,
      { backgroundColor: document.background.color || 'white' },
    ]}
  >
    {document.icon ? (
      <Image
        source={{ uri: document.icon }}
        style={{ width: 42, height: 42 }}
      />
    ) : (
      <View style={collapsedDocCardStyles.icon} />
    )}
  </View>
)
