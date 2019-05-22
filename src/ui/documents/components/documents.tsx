import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import {
  CollapsedDocumentCard,
  Document,
  DocumentCard,
} from 'src/ui/documents/components/documentCard'
import { DocumentViewToggle } from 'src/ui/documents/components/documentViewToggle'
import { ExpiredDocumentsOverview } from 'src/ui/documents/components/expiredDocumentsOverview'
import { DocumentDetails } from './documentDetails'
const Carousel = require('react-native-snap-carousel').default
const Pagination = require('react-native-snap-carousel').Pagination
import { demoDocuments } from '../TEST'

interface Props {
  // selectedExpiredDocument: Document | {}
  openExpiredDetails: (document: Document) => void
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topContainer: {
    paddingTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export class DocumentsComponent extends React.Component<Props> {
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

  private renderItem = ({ item }: { item: Document }) => (
    <View style={styles.topContainer}>
      {this.state.documentCollapsed ? (
        <CollapsedDocumentCard />
      ) : (
        <DocumentCard document={item} />
      )}
    </View>
  )

  public render(): JSX.Element {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocument, showingExpired } = this.state
    const {
      // selectedExpiredDocument,
      // setExpiredDocument,
      // clearExpiredDocument,
      openExpiredDetails,
    } = this.props

    return (
      <View style={styles.mainContainer}>
        <DocumentViewToggle
          showingExpired={showingExpired}
          handlePress={() => this.setState({ showingExpired: !showingExpired })}
        />
        {showingExpired ? (
          <ExpiredDocumentsOverview
            documents={demoDocuments}
            openExpiredDetails={openExpiredDetails}
          />
        ) : (
          <React.Fragment>
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
                  this.setState({
                    activeDocument: index,
                    documentCollapsed: false,
                  })
                }
              />
              <Pagination
                dotsLength={demoDocuments.length}
                activeDotIndex={activeDocument}
              />
            </View>
            <DocumentDetails
              document={demoDocuments[activeDocument]}
              onScroll={this.handleScroll}
            />
          </React.Fragment>
        )}
      </View>
    )
  }
}
