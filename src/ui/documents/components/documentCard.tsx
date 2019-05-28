import React from 'react'
import { View, StyleSheet, Text, Image, ImageBackground } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { DocumentValiditySummary } from './documentValidity'
import { DecoratedClaims } from 'src/reducers/account'
import { ClaimInterface } from 'cred-types-jolocom-core'

export const DOCUMENT_CARD_HEIGHT = 176
export const DOCUMENT_CARD_WIDTH = 276

interface DocumentCardProps {
  document: DecoratedClaims
}

const styles = StyleSheet.create({
  card: {
    height: DOCUMENT_CARD_HEIGHT,
    backgroundColor: JolocomTheme.primaryColorWhite,
    borderColor: 'rgba(0, 0, 0, 0.09)',
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
  const { renderInfo, expires } = document
  const { background = undefined, logo = undefined, text = undefined } =
    renderInfo || {}
  const claimData = document.claimData as ClaimInterface

  return (
    <View
      style={[
        styles.card,
        !background && { borderColor: 'rgb(255, 222, 188)' },
      ]}
    >
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
        <Text
          numberOfLines={2}
          style={[styles.documentType, { color: text && text.color }]}
        >
          {claimData.type}
        </Text>
        <Text style={[styles.documentNumber, { color: text && text.color }]}>
          {claimData.documentNumber}
        </Text>
        <View style={styles.validityContainer}>
          {expires && (
            <DocumentValiditySummary
              color={text && text.color}
              expires={expires}
            />
          )}
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
