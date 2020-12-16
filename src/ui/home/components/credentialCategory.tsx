import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { Typography, Spacing } from 'src/styles'
import I18n from 'src/locales/i18n'
import { DecoratedClaims } from 'src/reducers/account'
import { CredentialTypes } from 'src/lib/categories'
import { values, all, isEmpty } from 'ramda'
import { CredentialCard } from './credentialCard'
import { CollapsibleCredentialCard } from './collapsibleCredentialCard'
import { PlaceholderCredentialCard } from './placeholderCredentialCard'
import { getCredentialIconByType } from 'src/resources/util'

interface Props {
  category: string
  did: string
  credentials: DecoratedClaims[]
  onEdit: (claim: DecoratedClaims) => void
}

const styles = StyleSheet.create({
  sectionHeader: {
    ...Typography.sectionHeader,
    marginTop: Spacing.XL,
    marginBottom: Spacing.SM,
    paddingLeft: Spacing.MD,
  },
  leftIconSection: {
    paddingHorizontal: Spacing.XS,
  },
})

/**
 * CredentialCategory takes a category of credentials and renders all that are not
 * documents, sorted by credentialType. These are the categories rendered on
 * credentialOverview.
 *
 * The categories are found in: src/reducers/account/claims.ts
 * As of 2019-08-22, these categories are 'Personal', 'Contact' and 'Other'.
 */
export const CredentialCategory: React.FC<Props> = props => {
  const { category, credentials, did, onEdit } = props
  const credentialsSortedByType = credentials.sort((a, b) =>
    a.credentialType > b.credentialType ? 1 : -1,
  )

  return (
    <React.Fragment>
      <Text style={styles.sectionHeader}>{I18n.t(category)}</Text>

      {credentialsSortedByType.map((credential, i) => {
        const { claimData, credentialType } = credential
        const isBlank = all(isEmpty, values(claimData))

        const leftIcon = (
          <View style={styles.leftIconSection}>
            {getCredentialIconByType(credentialType)}
          </View>
        )

        if (isBlank) {
          return (
            <PlaceholderCredentialCard
              key={i}
              credential={credential}
              onPress={() => onEdit(credential)}
              leftIcon={leftIcon}
            />
          )
        }

        const CredentialCardToRender = isCollapsible(credential)
          ? CollapsibleCredentialCard
          : CredentialCard

        return (
          <CredentialCardToRender
            key={i}
            did={did}
            credential={credential}
            onPress={() => onEdit(credential)}
            leftIcon={leftIcon}
          />
        )
      })}
    </React.Fragment>
  )
}

/**
 * isCollapsible takes a claim and determines if the card rendered for that card
 * should be collapsible.
 *
 * As of 2019-08-22, only external multi-line non-document credentials are
 * collapsible.
 *
 * @BUG is PostalAddress meant to be collapsible? The way this is written, it
 * shouldn't be but currently it is. (2019-08-22) This is due to the fact that
 * the credentialType is Postal Address, whereas the key in the enum is
 * PostalAddress
 */
const isCollapsible = (claim: DecoratedClaims): boolean => {
  const { credentialType, claimData } = claim
  const isDefaultCredentialType = CredentialTypes[credentialType]
  if (isDefaultCredentialType) {
    return false
  }
  return Object.keys(claimData).filter(key => !!claimData[key]).length > 1
}
