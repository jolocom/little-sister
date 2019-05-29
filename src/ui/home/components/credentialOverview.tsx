import React, { SyntheticEvent } from 'react'
import { StyleSheet, Text, ScrollView, NativeEventEmitter, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { Container, Block } from 'src/ui/structure'
import { CredentialCard } from './credentialCard'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { ReactNode } from 'react'
import { ClaimsState } from 'src/reducers/account'
import { DecoratedClaims } from 'src/reducers/account/'
import { CredentialTypes } from 'src/lib/categories'
import { MoreIcon } from 'src/resources'
import { getCredentialIconByType } from 'src/resources/util'
import { prepareLabel } from 'src/lib/util'
import I18n from 'src/locales/i18n'
const loaders = require('react-native-indicator')

interface Props {
  claimsState: ClaimsState
  loading: boolean
  onEdit: (claim: DecoratedClaims) => void
  did: string
  scrollHideNav: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void
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
  renderCredentialCard = (category: string): ReactNode => {
    const { onEdit, did, claimsState } = this.props

    const categorizedCredentials = (
      claimsState.decoratedCredentials[category] || []
    ).sort((a, b) => (a.credentialType > b.credentialType ? 1 : -1))

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

  renderCredentialCategory = (category: string) => {
    if (!this.props.claimsState.decoratedCredentials[category].length) {
      return null
    }

    return [
      <Text style={styles.sectionHeader}>{I18n.t(category.toString())}</Text>,
      this.renderCredentialCard(category),
    ]
  }

  render() {
    const { decoratedCredentials, loading } = this.props.claimsState
    const { scrollComponent, scrollComponentLoading } = styles

    const claimCategories = Object.keys(decoratedCredentials)

    if (loading) {
      return renderLoadingScreen()
    }

    return (
      <Container style={{ padding: 0 }}>
        <ScrollView
          style={scrollComponent}
          contentContainerStyle={loading ? scrollComponentLoading : {}}
          onScroll={this.props.scrollHideNav}
        >
          {claimCategories.map(this.renderCredentialCategory)}
        </ScrollView>
      </Container>
    )
  }
}

const renderLoadingScreen = () => (
  <Block>
    <loaders.RippleLoader
      size={500}
      strokeWidth={7}
      color={JolocomTheme.primaryColorPurple}
    />
  </Block>
)

const collapsible = (claim: DecoratedClaims) => {
  const { credentialType, claimData } = claim

  const isDefaultCredentialType = CredentialTypes[credentialType]

  if (isDefaultCredentialType) {
    return false
  }

  return Object.keys(claimData).filter(key => !!claimData[key]).length > 1
}
