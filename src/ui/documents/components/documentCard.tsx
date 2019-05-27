import React from 'react'
import { View, StyleSheet, Text, Image, ImageBackground } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Color } from 'csstype'
import { DocumentValiditySummary } from './documentValidity'

export const DOCUMENT_CARD_WIDTH = 276
export const COLLAPSED_DOC_CARD_WIDTH = 101

export interface Document {
  details: {
    type: string
    documentNumber?: string
    [key: string]: any
  }
  id: string
  expires: Date | undefined
  issuer: string
  background?: {
    color?: Color
    // should be a URL to the image
    url?: string
  }
  // should be a URL to the image
  logo?: {
    url: string
  }
  text?: {
    color: string
  }
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
    width: DOCUMENT_CARD_WIDTH,
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

export const DocumentCard: React.SFC<DocumentCardProps> = ({
  document,
}): JSX.Element => {
  const { background, details, expires, logo } = document
  return (
    <View style={styles.card}>
      <ImageBackground
        style={[
          styles.cardBack,
          {
            backgroundColor: (background && background.color) || 'transparent',
          },
        ]}
        source={{
          uri: background && background.url,
        }}
      />
      <View style={styles.cardContent}>
        <Text style={styles.documentType}>{details.type}</Text>
        <Text style={styles.documentNumber}>{details.documentNumber}</Text>
        <View style={styles.validityContainer}>
          {expires && <DocumentValiditySummary expires={expires} />}
          {logo ? (
            <Image source={{ uri: logo.url }} style={styles.icon} />
          ) : (
            <View style={[styles.icon, { backgroundColor: 'grey' }]} />
          )}
        </View>
      </View>
    </View>
  )
}

const collapsedDocCardStyles = StyleSheet.create({
  card: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    width: COLLAPSED_DOC_CARD_WIDTH,
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

export const CollapsedDocumentCard: React.SFC<DocumentCardProps> = ({
  document,
}): JSX.Element => {
  const { background, logo } = document
  return (
    <View
      style={[
        collapsedDocCardStyles.card,
        { backgroundColor: (background && background.color) || 'white' },
      ]}
    >
      {logo ? (
        <Image source={{ uri: logo.url }} style={{ width: 42, height: 42 }} />
      ) : (
        <View style={collapsedDocCardStyles.icon} />
      )}
    </View>
  )
}
