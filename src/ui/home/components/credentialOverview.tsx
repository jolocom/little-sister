import React from 'react'
import { StyleSheet, Text, ScrollView } from 'react-native'
import { Container, Block } from 'src/ui/structure'
import { CredentialCard } from './credentialCard'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { ReactNode } from 'react'
import { CategorizedClaims } from 'src/reducers/account'
import { DecoratedClaims } from 'src/reducers/account/'
import { CredentialTypes } from 'src/lib/categories'
import { MoreIcon } from 'src/resources'
import { getCredentialIconByType } from 'src/resources/util'
import { prepareLabel } from 'src/lib/util'
import I18n from 'src/locales/i18n'
import { getDocumentClaims } from 'src/utils/filterDocuments'
const loaders = require('react-native-indicator')

interface Props {
  claimsToRender: CategorizedClaims
  loading: boolean
  onEdit: (claim: DecoratedClaims) => void
  did: string
}

interface State {}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 30,
    marginBottom: 10,
    paddingLeft: 16,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    color: 'rgba(0, 0, 0, 0.38)',
  },
  scrollComponent: {
    width: '100%',
  },
  scrollComponentLoading: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
})

export class CredentialOverview extends React.Component<Props, State> {
  private renderCredentialCard = (category: string): ReactNode => {
    const { onEdit, did, claimsToRender } = this.props

    let categorizedCredentials = (claimsToRender[category] || []).sort((a, b) =>
      a.credentialType > b.credentialType ? 1 : -1,
    )
    if (category === 'Other') {
      categorizedCredentials = getDocumentClaims(categorizedCredentials)
    }

    return categorizedCredentials.map((claim: DecoratedClaims, index) => {
      const filteredKeys = Object.keys(claim.claimData).filter(
        el => el !== 'id',
      )
      const captialized = filteredKeys.reduce(
        (acc, curr) => ({
          ...acc,
          [prepareLabel(curr)]: claim.claimData[curr],
        }),
        {},
      )
      const selfSigned = claim.issuer === did

      return (
        <CredentialCard
          key={claim.credentialType}
          handleInteraction={() => onEdit(claim)}
          credentialItem={{ ...claim, claimData: captialized }}
          collapsible={collapsible(claim)}
          rightIcon={selfSigned ? <MoreIcon /> : null}
          leftIcon={getCredentialIconByType(claim.credentialType)}
          containerStyle={index === 0 ? { borderTopWidth: 1 } : undefined}
        />
      )
    })
  }

  private renderCredentialCategory = (category: string) => {
    if (!this.props.claimsToRender[category].length) {
      return null
    }

    return [
      <Text style={styles.sectionHeader}>{I18n.t(category.toString())}</Text>,
      this.renderCredentialCard(category),
    ]
  }

  public render(): JSX.Element {
    const { claimsToRender, loading } = this.props
    const { scrollComponent, scrollComponentLoading } = styles

    const claimCategories = Object.keys(claimsToRender)

    if (loading) {
      return renderLoadingScreen()
    }

    return (
      <Container style={{ padding: 0 }}>
        <ScrollView
          style={scrollComponent}
          contentContainerStyle={loading ? scrollComponentLoading : {}}
        >
          {claimCategories.map(this.renderCredentialCategory)}
        </ScrollView>
      </Container>
    )
  }
}

const renderLoadingScreen = (): JSX.Element => (
  <Block>
    <loaders.RippleLoader
      size={500}
      strokeWidth={7}
      color={JolocomTheme.primaryColorPurple}
    />
  </Block>
)

const collapsible = (claim: DecoratedClaims): boolean => {
  const { credentialType, claimData } = claim

  const isDefaultCredentialType = CredentialTypes[credentialType]

  if (isDefaultCredentialType) {
    return false
  }

  return Object.keys(claimData).filter(key => !!claimData[key]).length > 1
}
