import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native'
import {
  CollapsedDocumentCard,
  Document,
  DocumentCard,
  DOCUMENT_CARD_WIDTH,
  COLLAPSED_DOC_CARD_WIDTH,
} from 'src/ui/documents/components/documentCard'
import { DocumentViewToggle } from 'src/ui/documents/components/documentViewToggle'
import { ExpiredDocumentsOverview } from 'src/ui/documents/components/expiredDocumentsOverview'
import { DocumentDetails } from './documentDetails'
const Carousel = require('react-native-snap-carousel').default
import { demoDocuments } from '../TEST'

interface Props {
  openExpiredDetails: (document: Document) => void
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export class DocumentsComponent extends React.Component<Props> {
  public state = {
    activeDocument: 0,
    documentCollapsed: false,
    showingValid: true,
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

  private renderItem = ({ item }: { item: Document }) =>
    this.state.documentCollapsed ? (
      <CollapsedDocumentCard document={item} />
    ) : (
      <DocumentCard document={item} />
    )

  public render(): JSX.Element {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocument, showingValid, documentCollapsed } = this.state
    const { openExpiredDetails } = this.props

    return (
      <View style={styles.mainContainer}>
        <DocumentViewToggle
          showingValid={showingValid}
          handlePress={() => this.setState({ showingValid: !showingValid })}
        />
        {showingValid ? (
          <React.Fragment>
            <View style={styles.topContainer}>
              <Carousel
                data={demoDocuments}
                renderItem={this.renderItem}
                lockScrollWhileSnapping
                lockScrollTimeoutDuration={1000}
                sliderWidth={viewWidth}
                itemWidth={
                  documentCollapsed
                    ? COLLAPSED_DOC_CARD_WIDTH
                    : DOCUMENT_CARD_WIDTH
                }
                layout={'default'}
                onSnapToItem={(index: number) => {
                  this.setState({
                    activeDocument: index,
                  })
                  this.ScrollViewRef.scrollTo({ x: 0, y: 0, animated: true })
                }}
              />
            </View>
            <ScrollView
              onScroll={this.handleScroll}
              scrollEventThrottle={16}
              // to give a scroll animation upon changing card
              ref={ref => (this.ScrollViewRef = ref)}
            >
              <DocumentDetails document={demoDocuments[activeDocument]} />
            </ScrollView>
          </React.Fragment>
        ) : (
          <ExpiredDocumentsOverview
            documents={demoDocuments}
            openExpiredDetails={openExpiredDetails}
          />
        )}
      </View>
    )
  }
}
