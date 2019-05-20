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
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'
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

export const DocumentCard: React.SFC<DocumentCardProps> = (
  props,
): JSX.Element => (
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

const collapsedDocCardStyles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: JolocomTheme.primaryColorWhite,
    width: 101,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'grey',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: JolocomTheme.primaryColorGrey,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export const CollapsedDocumentCard = (props): JSX.Element => (
  <View style={collapsedDocCardStyles.container}>
    <View style={collapsedDocCardStyles.card}>
      <View style={collapsedDocCardStyles.icon}>
        <Icon size={20} name="checkbox-multiple-blank" />
      </View>
    </View>
  </View>
)

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
      <CollapsedDocumentCard document={item} />
    ) : (
      <DocumentCard document={item} />
    )
  }

  public render(): JSX.Element {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocument } = this.state

    return (
      <View style={styles.mainContainer}>
        <View>
          <Carousel
            data={demoDocuments}
            renderItem={this.renderItem}
            lockScrollWhileSnapping
            lockScrollTimeoutDuration={1000}
            sliderWidth={viewWidth}
            itemWidth={viewWidth - 30}
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
