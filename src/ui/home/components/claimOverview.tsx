import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { StyleSheet, TouchableOpacity, Text, View, ScrollView } from 'react-native'
import { Container, Block } from 'src/ui/structure'
import { ClaimCard } from 'src/ui/home/components/claimCard'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { ReactNode } from 'react'

// TODO: adjust to actual structure needed for UI
export interface Claim {
  claimType: string
  claimValue?: string
  category: string
}

interface Props {
  claims: any
  scanning: boolean
  onScannerStart: () => void
  openClaimDetails: (selectedType : string) => void
}

interface State {
}

interface IDefMap {
  [key: string]: string
}

const iconMap : IDefMap = {
  name: 'person',
  email: 'camera',
  phone: 'camera'
}

const categoryDisplayMap : IDefMap = {
  personal: 'Personal / general',
  contact: 'Contact',
  other: 'Miscellaneous'
}

const styles = StyleSheet.create({
  icon: {
    margin: "20%"
  },
  iconContainer: {
    height: 55,
    width: 55,
    borderRadius: 35,
    backgroundColor: JolocomTheme.palette.primaryColor,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 8,
  },
  actionButtonContainer: {
    position: 'absolute',
    right: '3%',
    bottom: '5%',
    alignItems: 'flex-end'
  },
  sectionHeader: {
    fontSize: 17,
    textAlign: 'left'
  },
  componentContainer: {
    flex: 1,
    padding: 0
  },
  scrollComponent: {
    width: '100%'
  },
  sectionContainer: {
    marginBottom: 8,
    marginTop: 27,
    marginLeft: 16,
    marginRight: 16
  }
})





export class ClaimOverviewComponent extends React.Component<Props, State> {

  renderClaimCards = (category: any) : ReactNode => {
    const { openClaimDetails, claims } = this.props
    const categoryClaims = claims.savedClaims[category]

    return categoryClaims.map((claim: Claim, i: number) => {
      if (claim.claimType === 'name') {
        if (claim.claimValue === undefined) {
          return (
            <ClaimCard
              key={ claim.claimType }
              openClaimDetails={ openClaimDetails }
              claimType={ claim.claimType }
              icon={ iconMap[claim.claimType] }
              firstClaimLabel={ claim.claimType }
            />
          )
        } else {
          return (
            <ClaimCard
              key={ claim.claimValue }
              openClaimDetails={ openClaimDetails }
              claimType={ claim.claimType }
              icon={ iconMap[claim.claimType] }
              firstClaimLabel={ 'first Name' }
              firstClaimValue={ claim.claimValue }
              secondClaimLabel={ 'last Name '}
              secondClaimValue={ claim.claimValue }
              claimLines={2}
            />
          )
        }

      } else {
        if (claim.claimValue === undefined) {
          return (
            <ClaimCard
              key={ claim.claimType }
              openClaimDetails={ openClaimDetails }
              claimType={ claim.claimType }
              icon={ iconMap[claim.claimType] }
              firstClaimLabel={ claim.claimType }
            />
          )
        } else {
          return (
            <ClaimCard
              key={ claim.claimValue }
              openClaimDetails={ openClaimDetails }
              claimType={ claim.claimType }
              icon={ iconMap[claim.claimType] }
              firstClaimLabel={ claim.claimType }
              firstClaimValue={ claim.claimValue }
            />
          )
        }
      }
    })
  }

  render() {
    const { savedClaims } = this.props.claims
    let content
    if (this.props.claims.loading) {
      // TODO: insert loading component
      content = (
        <View><Text>Loading</Text></View>
      )
    } else {
      content = (
        savedClaims.claimCategories.map((category: any, i: number) => {
          return (
            <View key={category}>
              <View>
                <View style={ styles.sectionContainer }>
                  <Text style={ styles.sectionHeader }>{ categoryDisplayMap[category] }</Text>
                </View>
                { this.renderClaimCards(category) }
              </View>
            </View>
          )})
      )
    }

    return (
      <Container style={ styles.componentContainer }>
        <ScrollView style={ styles.scrollComponent }>
          { content }
        </ScrollView>
        <Block style={ styles.actionButtonContainer }>
          <TouchableOpacity
            style={ styles.iconContainer }
            onPress={ this.props.onScannerStart }>
            <Icon
              style={ styles.icon }
              size={ 30 }
              name="qrcode-scan"
              color="white"
            />
          </TouchableOpacity>
        </Block>

      </Container>
    )
  }
}
