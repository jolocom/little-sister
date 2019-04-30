import React from 'react'
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
// import I18n from 'src/locales/i18n'
import { SectionClaimCard } from 'src/ui/structure/claimCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
const Carousel = require('react-native-snap-carousel').default
const Pagination = require('react-native-snap-carousel').Pagination

interface Props {}

interface Document {
  details: {
    type: string
    id_number: string
    [key: string]: string
  }
  valid_until: Date | undefined
  issuer: string
}

interface DocumentCardProps {
  document: Document
}

const demoDocuments: Document[] = [
  {
    issuer: 'did:jolo:aa1bb2cc3dd4',
    details: {
      id_number: 'T3ST0001',
      type: 'A-kaart',
    },
    valid_until: new Date(Date.parse('2020-04-29')),
  },
  {
    issuer: 'did:jolo:zz9xx8dd7vv6',
    details: {
      id_number: 'D3M0002',
      type: 'Digital ID Card',
      gender: 'male',
      birth_place: 'berlin',
    },
    valid_until: new Date(Date.parse('2024-05-14')),
  },
]

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    height: 26,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    color: 'grey',
    paddingHorizontal: 16,
  },
  issuedByContainer: {
    marginBottom: 0,
    padding: 20,
  },
})

const debug = {
  // borderColor: 'red',
  // borderWidth: 1,
}

const documentCardStyles = StyleSheet.create({
  container: {
    ...debug,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  card: {
    ...debug,
    height: 176,
    backgroundColor: JolocomTheme.primaryColorSand,
    borderColor: 'rgb(233, 233, 233)',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingVertical: 16,
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
  },
  validityContainer: {
    flexDirection: 'row',
    color: 'red',
    marginTop: 'auto',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
  },
  validityText: {
    marginLeft: 5,
    fontSize: 17,
  },
})

export const DocumentCard: React.SFC<DocumentCardProps> = props => (
  <View style={documentCardStyles.container}>
    <View style={documentCardStyles.card}>
      <Text style={documentCardStyles.documentType}>
        {props.document.details.type}
      </Text>
      <Text style={documentCardStyles.documentNumber}>
        {props.document.details.id_number}
      </Text>
      <View style={documentCardStyles.validityContainer}>
        <Icon size={17} name="check-all" />
        {props.document.valid_until && (
          <Text style={documentCardStyles.validityText}>
            Valid until {props.document.valid_until.toLocaleDateString('en-GB')}
          </Text>
        )}
      </View>
    </View>
  </View>
)

export class InteractionsComponent extends React.Component<Props> {
  state = {
    activeDocument: 0,
  }

  renderDocument = ({ item }: { item: Document }) => {
    return <DocumentCard document={item} />
  }

  render() {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocument } = this.state

    return (
      <View style={styles.mainContainer}>
        <View>
          <Carousel
            data={demoDocuments}
            renderItem={this.renderDocument}
            lockScrollWhileSnapping
            lockScrollTimeoutDuration={1000}
            sliderWidth={viewWidth}
            itemWidth={viewWidth}
            layout={'default'}
            onSnapToItem={(index: number) =>
              this.setState({ activeDocument: index })
            }
          />
          <Pagination
            dotsLength={demoDocuments.length}
            activeDotIndex={activeDocument}
          />
        </View>
        <ScrollView style={{ width: '100%' }}>
          <Text style={styles.sectionHeader}>Issued by</Text>
          {/* Make new component for this? */}
          <SectionClaimCard
            title=""
            primaryText={demoDocuments[activeDocument].issuer}
            secondaryText="https://www.theissuer.com"
            leftIcon={
              <Icon size={20} name="account-card-details" color="grey" />
            }
            rightIcon={<Icon size={25} name="chevron-down" color="grey" />}
          />
          <Text style={styles.sectionHeader}>Details</Text>
          {/* Make titles dependent on something else, light grey instead of black */}
          {Object.keys(demoDocuments[activeDocument].details).map(key => (
            <SectionClaimCard
              title={key}
              primaryText={demoDocuments[activeDocument].details[key]}
              leftIcon={
                <Icon size={20} name="checkbox-blank" color="lightgrey" />
              }
            />
          ))}
        </ScrollView>
      </View>
    )
  }
}
