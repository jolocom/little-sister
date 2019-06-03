import React from 'react'
import { View, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native'
import {
  DocumentCard,
  DOCUMENT_CARD_WIDTH,
} from 'src/ui/documents/components/documentCard'
import { DocumentViewToggle } from 'src/ui/documents/components/documentViewToggle'
import { ExpiredDocumentsOverview } from 'src/ui/documents/components/expiredDocumentsOverview'
import { DocumentDetails } from './documentDetails'
const Carousel = require('react-native-snap-carousel').default
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { DecoratedClaims } from 'src/reducers/account'

interface Props {
  openExpiredDetails: (document: DecoratedClaims) => void
  expiredDocuments: DecoratedClaims[]
  validDocuments: DecoratedClaims[]
  scrollValue: Animated.Value
}

interface State {
  activeDocumentIndex: number
  showingValid: boolean
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: JolocomTheme.primaryColorGrey,
  },
  topContainer: {
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export class DocumentsComponent extends React.Component<Props, State> {
  public ScrollViewRef: ScrollView | null = null

  public state = {
    activeDocumentIndex: 0,
    showingValid: true,
  }

  private handleTouch = () => {
    this.setState((prevState: State) => ({
      showingValid: !prevState.showingValid,
      activeDocumentIndex: 0,
    }))
  }

  private renderItem = ({ item }: { item: DecoratedClaims }) => (
    <DocumentCard document={item} />
  )

  public render(): JSX.Element {
    const viewWidth: number = Dimensions.get('window').width
    const { activeDocumentIndex, showingValid } = this.state
    const { expiredDocuments, validDocuments, openExpiredDetails } = this.props

    /** @TODO Temporary, to avoid crash */
    if (!expiredDocuments.length || !validDocuments.length) {
      return <View />
    }

    return (
      <View style={styles.mainContainer}>
        <DocumentViewToggle
          showingValid={showingValid}
          onTouch={this.handleTouch}
        />
        {showingValid ? (
          <React.Fragment>
            <ScrollView
              scrollEventThrottle={16}
              onScroll={ Animated.event([{nativeEvent: {contentOffset: {y: this.props.scrollValue}}}])}
              // to give a scroll animation upon changing card
              ref={ref => (this.ScrollViewRef = ref)}
            >
              <Carousel
                data={validDocuments}
                renderItem={this.renderItem}
                lockScrollWhileSnapping
                lockScrollTimeoutDuration={1000}
                sliderWidth={viewWidth}
                itemWidth={DOCUMENT_CARD_WIDTH}
                layout={'default'}
                onSnapToItem={(index: number) => {
                  this.setState({
                    activeDocumentIndex: index,
                  })
                  if (this.ScrollViewRef) {
                    this.ScrollViewRef.scrollTo({ x: 0, y: 0, animated: true })
                  }
                }}
              />
              <DocumentDetails document={validDocuments[activeDocumentIndex]} />
            </ScrollView>
          </React.Fragment>
        ) : (
          <ExpiredDocumentsOverview
            documents={expiredDocuments}
            openExpiredDetails={openExpiredDetails}
          />
        )}
      </View>
    )
  }
}
