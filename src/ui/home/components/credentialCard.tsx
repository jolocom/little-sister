import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { DecoratedClaims } from 'src/reducers/account'
import I18n from 'src/locales/i18n'
import { CardWrapper } from 'src/ui/structure'
import { Spacing, Typography } from 'src/styles'
import MoreIcon from 'src/resources/svg/MoreIcon'
import { prepareLabel } from 'src/lib/util'
import { credentialStyles } from './sharedConstants'

interface Props {
  onPress?: () => void
  did: string
  credential: DecoratedClaims
  leftIcon: React.ReactNode
}

const styles = StyleSheet.create({
  card: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  claimLabel: {
    ...Typography.cardSecondaryText,
  },
  claimText: {
    ...Typography.cardMainText,
    marginBottom: Spacing.XXS,
  },
})

/**
 * CredentialCard renders a credential with its labels and values for each of its
 * claims.
 */
export const CredentialCard: React.FC<Props> = props => {
  const {
    credential: { claimData, issuer },
    did,
    onPress,
    leftIcon,
  } = props
  const selfSigned = issuer.did === did

  return (
    <CardWrapper style={styles.card}>
      {leftIcon && leftIcon}
      <View style={credentialStyles.claimsArea}>
        {Object.keys(claimData).map(key => (
          <React.Fragment key={key}>
            <Text style={styles.claimLabel}>{I18n.t(prepareLabel(key))}</Text>
            <Text style={styles.claimText}>{claimData[key]}</Text>
          </React.Fragment>
        ))}
      </View>
      {selfSigned && (
        <TouchableOpacity
          style={credentialStyles.rightIconArea}
          onPress={onPress}>
          <MoreIcon />
        </TouchableOpacity>
      )}
    </CardWrapper>
  )
}
