import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DecoratedClaims } from 'src/reducers/account'
import I18n from 'src/locales/i18n'
import { CardWrapper } from 'src/ui/structure'
import { Spacing, Typography } from 'src/styles'
import MoreIcon from 'src/resources/svg/MoreIcon'
import { prepareLabel } from 'src/lib/util'
import { credentialStyles } from './sharedConstants'
import { Colors } from 'src/styles'

interface Props {
  onPress?: () => void
  did: string
  credential: DecoratedClaims
  leftIcon: React.ReactNode
}

const styles = StyleSheet.create({
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  validityText: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    marginLeft: Spacing.XXS,
  },
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
            <Text style={styles.claimLabel}>{prepareLabel(I18n.t(key))}</Text>
            <Text style={styles.claimText}>{I18n.t(claimData[key])}</Text>
          </React.Fragment>
        ))}
      </View>
      {selfSigned ? (
        <View style={credentialStyles.rightIconArea} onTouchEnd={onPress}>
          <MoreIcon />
        </View>
      ) : (
        <View style={styles.validityContainer}>
          <Icon size={17} name="check-all" color={Colors.greenMain} />
          <Text style={[styles.validityText, { color: Colors.greenMain }]}>
            {issuer?.publicProfile?.name}
          </Text>
        </View>
      )}
    </CardWrapper>
  )
}
