import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native'
import { DocumentValiditySummary } from './documentValidity'
import { ClaimInterface } from 'cred-types-jolocom-core'
import { Colors, Typography, Spacing, Typefaces } from 'src/styles'
import { CredentialOfferRenderInfo } from 'jolocom-lib/js/interactionTokens/interactionTokens.types'
import { fontMedium } from '../../../styles/typography'
import { InvalidDocumentBackground } from '../../../resources'

const { width: WIDTH } = Dimensions.get('window')
// TODO @clauxx rename
const DOCUMENT_MARGIN = 20
export const DOCUMENT_CARD_WIDTH = WIDTH - DOCUMENT_MARGIN * 2
export const DOCUMENT_CARD_HEIGHT = DOCUMENT_CARD_WIDTH * 0.636

interface DocumentCardProps {
  credentialType: string
  renderInfo: CredentialOfferRenderInfo | undefined
  claimData?: ClaimInterface
  expires?: Date
  invalid?: boolean
  transform?: any
  shadow?: boolean
}

const styles = StyleSheet.create({
  card: {
    height: DOCUMENT_CARD_HEIGHT,
    width: DOCUMENT_CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingTop: 26,
    paddingBottom: 12,
  },
  documentType: {
    // TODO @clauxx add BOLD font here
    ...Typefaces.subtitle1,
    fontFamily: fontMedium,
    paddingHorizontal: Spacing.MD,
  },
  documentNumber: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    color: Colors.black040,
    paddingHorizontal: Spacing.MD,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    paddingHorizontal: Spacing.MD,
    marginTop: 'auto',
  },
  icon: {
    width: 40,
    height: 40,
    marginLeft: 'auto',
  },
})

export const DocumentCard: React.FC<DocumentCardProps> = props => {
  const {
    renderInfo,
    claimData,
    credentialType,
    expires,
    invalid,
    shadow = false,
  } = props
  const { background = undefined, logo = undefined, text = undefined } =
    renderInfo || {}
  const cardBackground = invalid
    ? InvalidDocumentBackground
    : { uri: background?.url }

  /**
   * NOTE @clauxx: Using .gif as background images causes inconsistencies with border radius and
   * scaling. To disable gif animation support, remove the `com.facebook.fresco` lines from `build.gradle`.
   * Note that when disabled, gifs will be handled as images.
   */
  return (
    <View
      style={[
        styles.card,
        !background && { borderColor: Colors.sand },
        shadow && { elevation: 12 },
      ]}>
      <ImageBackground
        borderRadius={12}
        style={[
          styles.cardBack,

          {
            backgroundColor: (background && background.color) || 'transparent',
          },
        ]}
        resizeMode={'cover'}
        source={cardBackground}
      />
      <View style={styles.cardContent}>
        <Text
          numberOfLines={2}
          style={[
            styles.documentType,
            { color: invalid ? 'rgb(182, 182, 182)' : text && text.color },
          ]}>
          {credentialType || (claimData && claimData.type)}
        </Text>
        {claimData && (
          <Text style={[styles.documentNumber, { color: text && text.color }]}>
            {claimData.documentNumber}
          </Text>
        )}
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
            <View
              style={[styles.icon, { backgroundColor: 'transparent' }]}
            />
          )}
        </View>
      </View>
    </View>
  )
}
