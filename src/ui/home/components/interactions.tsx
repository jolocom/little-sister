import React from 'react'
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import {
  CollapsedDocumentCard,
  Document,
  DocumentCard,
} from 'src/ui/home/components/documentCard'
import { DocumentViewToggle } from 'src/ui/home/components/documentViewToggle'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'
const Carousel = require('react-native-snap-carousel').default
const Pagination = require('react-native-snap-carousel').Pagination

interface Props {}

const demoDocuments: Document[] = [
  // {
  //   issuer: 'did:jolo:aa1bb2cc3dd4',
  //   details: {
  //     id_number: 'T3ST0001',
  //     type: 'A-kaart',
  //   },
  //   valid_until: new Date(Date.parse('2020-04-29')),
  // },
  // {
  //   issuer: 'did:jolo:aa1bb2cc3dd4',
  //   details: {
  //     id_number: 'T3ST0001',
  //     type: 'A-kaart',
  //   },
  //   valid_until: new Date(Date.parse('2020-04-29')),
  // },
  // {
  //   issuer: 'did:jolo:aa1bb2cc3dd4',
  //   details: {
  //     id_number: 'T3ST0001',
  //     type: 'A-kaart',
  //   },
  //   valid_until: new Date(Date.parse('2020-04-29')),
  // },
  // {
  //   issuer: 'did:jolo:aa1bb2cc3dd4',
  //   details: {
  //     id_number: 'T3ST0001',
  //     type: 'A-kaart',
  //   },
  //   valid_until: new Date(Date.parse('2020-04-29')),
  // },
  // {
  //   issuer: 'did:jolo:aa1bb2cc3dd4',
  //   details: {
  //     id_number: 'T3ST0001',
  //     type: 'A-kaart',
  //   },
  //   valid_until: new Date(Date.parse('2020-04-29')),
  // },
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
  {
    issuer: 'did:jolo:asdqw1321',
    details: {
      id_number: 'N0TR34L',
      type: 'Digital Passport',
      gender: 'male',
      birth_place: 'berlin',
    },
    valid_until: new Date(Date.parse('2016-03-12')),
  },
]

const debug = {
  // borderColor: 'red',
  // borderWidth: 1,
}

const issuerCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: JolocomTheme.primaryColorWhite,
    paddingVertical: 18,
    paddingLeft: 15,
    paddingRight: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ececec',
  },
  icon: {
    width: 42,
    height: 42,
  },
  textContainer: {
    marginLeft: 16,
  },
  text: {
    fontSize: 17,
    color: JolocomTheme.primaryColorPurple,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

const IssuerCard = (props): JSX.Element => {
  return (
    <View style={issuerCardStyles.container}>
      {/* TODO: Add support for icon */}
      <View style={issuerCardStyles.textContainer}>
        <Text
          style={JolocomTheme.textStyles.light.textDisplayField}
          numberOfLines={1}
        >
          {I18n.t('Name of issuer')}
        </Text>
        <Text style={issuerCardStyles.text} numberOfLines={1}>
          {props.issuer}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 20,
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
    color: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    marginBottom: 10,
    paddingLeft: 16,
  },
  claimsList: {
    borderTopWidth: 1,
    borderTopColor: '#ececec',
  },
  claimCard: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ececec',
  },
  claimCardTextContainer: {
    paddingHorizontal: 30,
  },
  claimCardTitle: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 17,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

export class InteractionsComponent extends React.Component<Props> {
  public state = {
    activeDocument: 0,
    documentCollapsed: false,
    showingExpired: false,
  }

  private handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent> | undefined,
  ) => {
    let documentCollapsed = false
    if (event && event.nativeEvent.contentOffset.y > 5) {
      documentCollapsed = true
    }
    this.setState({ documentCollapsed })
  }

  private renderItem = ({ item }: { item: Document }) => {
    return this.state.documentCollapsed ? (
      <CollapsedDocumentCard />
    ) : (
      <DocumentCard document={item} />
    )
  }

  public render(): JSX.Element {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocument, showingExpired } = this.state

    return (
      <View style={styles.mainContainer}>
        <DocumentViewToggle
          showingExpired={showingExpired}
          handlePress={() => this.setState({ showingExpired: !showingExpired })}
        />
        <View>
          <Carousel
            data={demoDocuments}
            renderItem={this.renderItem}
            lockScrollWhileSnapping
            lockScrollTimeoutDuration={1000}
            sliderWidth={viewWidth}
            itemWidth={viewWidth}
            layout={'default'}
            onSnapToItem={(index: number) =>
              this.setState({ activeDocument: index, documentCollapsed: false })
            }
          />
          <Pagination
            dotsLength={demoDocuments.length}
            activeDotIndex={activeDocument}
          />
        </View>
        <ScrollView style={{ width: '100%' }} onScroll={this.handleScroll}>
          <Text style={styles.sectionHeader}>Issued by</Text>
          <IssuerCard issuer={demoDocuments[activeDocument].issuer} />

          <Text style={styles.sectionHeader}>Details</Text>
          {Object.keys(demoDocuments[activeDocument].details).map(key => (
            <View key={key} style={styles.claimCard}>
              <View style={styles.claimCardTextContainer}>
                {/* TODO: Capitalize key? */}
                <Text style={styles.claimCardTitle}>{key}</Text>
                <Text style={JolocomTheme.textStyles.light.textDisplayField}>
                  {demoDocuments[activeDocument].details[key]}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}
