import React from 'react'
import { StyleSheet, Image, View, Text, ViewStyle } from 'react-native'
import { Colors, Spacing, Typography } from 'src/styles'
import { CardWrapper } from 'src/ui/structure'
import strings from 'src/locales/strings'
import I18n from 'src/locales/i18n'
import { IdentitySummary } from '@jolocom/sdk'

interface Props {
  issuer: IdentitySummary
  style?: ViewStyle
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
  },
  issuerTextContainer: {
    // needed so the text overflow turns into ellipsis
    flex: 1,
    marginLeft: Spacing.MD,
  },
  nameText: {
    ...Typography.cardMainText,
  },
  urlText: {
    ...Typography.cardSecondaryText,
    color: Colors.purpleMain,
  },
})

export const IssuerCard: React.FC<Props> = props => {
  const {
    style: propsStyle,
    issuer: { publicProfile: issuerPublicProfile, did: issuerDid },
  } = props

  const publicProfile = issuerPublicProfile || {
    name: I18n.t(strings.NO_SERVICE_NAME),
    url: issuerDid,
    description: '',
  }

  const { name, image, url } = publicProfile

  return (
    <CardWrapper style={[styles.container, propsStyle]}>
      {image && <Image source={{ uri: image }} style={styles.icon} />}
      <View style={styles.issuerTextContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.urlText} numberOfLines={1}>
          {url}
        </Text>
      </View>
    </CardWrapper>
  )
}
