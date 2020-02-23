import React from 'react'
import { connect } from 'react-redux'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'

import { openDocumentDetails } from 'src/actions/documents'
import { DecoratedClaims } from 'src/reducers/account'
import { RootState } from 'src/reducers'
import { getDocumentClaims } from 'src/utils/filterDocuments'
import { ThunkDispatch } from 'src/store'

import I18n from 'src/locales/i18n'
import { filters } from 'src/lib/filterDecoratedClaims'

import { DocumentsCarousel } from '../components/documentsCarousel'
import { DocumentsList } from '../components/documentsList'
import { DocumentViewToggle } from '../components/documentViewToggle'
import strings from '../../../locales/strings'
import { Typography, Colors, Spacing } from 'src/styles'
import { Wrapper } from '../../structure'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from 'src/lib/storage/interactionTokens'
import { withLoading, withErrorScreen } from 'src/actions/modifiers'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

interface State {
  activeDocumentIndex: number
  showingValid: boolean
}

/*
const APPBAR_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 64,
})
*/

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.lightGreyLighter,
  },
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.MD,
  },
  emptyDocumentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.MD,
  },
  emptyDocumentsText: {
    ...Typography.mainText,
    ...Typography.centeredText,
    color: Colors.greyLight,
  },
})

export class DocumentsContainer extends React.Component<Props, State> {
  public ScrollViewRef: ScrollView | null = null

  public state = {
    activeDocumentIndex: 0,
    showingValid: true,
  }

  private scrollToTop(): void {
    if (this.ScrollViewRef) {
      this.ScrollViewRef.scrollTo({ x: 0, y: 0, animated: true })
    }
  }

  private onActiveIndexChange(index: number): void {
    this.setState({ activeDocumentIndex: index })
    this.scrollToTop()
  }

  private handleToggle = () => {
    this.setState((prevState: State) => ({
      showingValid: !prevState.showingValid,
      activeDocumentIndex: 0,
    }))
    this.scrollToTop()
  }

  public render(): JSX.Element {
    const { openDocumentDetails, decoratedCredentials, doAction } = this.props
    console.log('is it though, container', doAction)
    const documents = getDocumentClaims(decoratedCredentials['Other'])
    const docFilter = this.state.showingValid
      ? filters.filterByValid
      : filters.filterByExpired
    const displayedDocs = docFilter(documents)
    const isEmpty = displayedDocs.length === 0
    const otherIsEmpty = displayedDocs.length === documents.length

    return (
      <Wrapper style={styles.mainContainer}>
        <Animated.View style={{ flex: 1 }}>
          {!otherIsEmpty && (
            <DocumentViewToggle
              showingValid={this.state.showingValid}
              onTouch={this.handleToggle}
            />
          )}
          <ScrollView
            // scrollEventThrottle={16}
            // onScroll={Animated.event([
            //   {
            //     nativeEvent: {
            //       contentOffset: { y: this.state.headerHeight },
            //     },
            //   },
            // ])}
            // to scroll to top upon changing card
            ref={ref => (this.ScrollViewRef = ref)}
            contentContainerStyle={
              isEmpty ? { flex: 1 } : { paddingBottom: 110 }
            }
            scrollEnabled={!isEmpty}
          >
            {isEmpty ? (
              <View style={styles.emptyDocumentsContainer}>
                <Text style={styles.emptyDocumentsText}>
                  {I18n.t(strings.NO_DOCUMENTS_TO_SEE_HERE) + '...'}
                </Text>
              </View>
            ) : this.state.showingValid ? (
              <DocumentsCarousel
                documents={displayedDocs}
                doAction={doAction}
                activeIndex={this.state.activeDocumentIndex}
                onActiveIndexChange={this.onActiveIndexChange.bind(this)}
              />
            ) : (
              <DocumentsList
                documents={displayedDocs}
                onDocumentPress={openDocumentDetails}
              />
            )}
          </ScrollView>
        </Animated.View>
      </Wrapper>
    )
  }
}

const mapStateToProps = ({
  account: {
    claims: { decoratedCredentials },
  },
}: RootState) => ({
  decoratedCredentials,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  openDocumentDetails: (doc: DecoratedClaims) =>
    dispatch(openDocumentDetails(doc)),

  doAction: async (action: any) => {
    console.log('doing action', action)

    const credJson = await fetch(action.url).then(res => res.json())
    const interactionToken = JolocomLib.parse.interactionToken.fromJSON(
      credJson,
    )
    const handler = interactionHandlers[interactionToken.interactionType]

    if (handler) {
      return dispatch(
        withLoading(withErrorScreen(handler(interactionToken, true))),
      )
    }
  },
})

export const Documents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsContainer)
