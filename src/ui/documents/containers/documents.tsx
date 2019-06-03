import React from 'react'
import { DocumentsComponent } from 'src/ui/documents/components/documents'
import { connect } from 'react-redux'
import { openExpiredDetails } from 'src/actions/documents'
import { CategorizedClaims, DecoratedClaims } from 'src/reducers/account'
import { getDocumentClaims } from 'src/utils/filterDocuments'
import {RootState} from '../../../reducers'
import {ThunkDispatch} from '../../../store'
import { Animated } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

interface ConnectProps {
  decoratedCredentials: CategorizedClaims
  openExpiredDetails: typeof openExpiredDetails
  navigation: NavigationScreenProps<any>
}

interface Props extends ConnectProps {}

interface State {
    documentScroll: Animated.Value
}

export class DocumentsContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            documentScroll: new Animated.Value(0)
        }
        this.state.documentScroll.addListener((state: {value: number}) => {
            this.props.navigation.navigation.setParams({tabBarHeight: state.value})
        })
    }
  private getValidDocuments = (claims: DecoratedClaims[]) =>
    claims.filter(claim =>
      claim.expires ? claim.expires.valueOf() >= new Date().valueOf() : true,
    )

  private getExpiredDocuments = (claims: DecoratedClaims[]) =>
    claims.filter(
      document =>
        document.expires && document.expires.valueOf() < new Date().valueOf(),
    )

  public render(): JSX.Element {
    const { openExpiredDetails, decoratedCredentials } = this.props
    const documents = getDocumentClaims(decoratedCredentials['Other'])
    const expiredDocuments = this.getExpiredDocuments(documents)
    const validDocuments = this.getValidDocuments(documents)

    return (
      <DocumentsComponent
        validDocuments={validDocuments}
        expiredDocuments={expiredDocuments}
        openExpiredDetails={openExpiredDetails}
        scrollValue={this.state.documentScroll}
      />
    )
  }
}

const mapStateToProps = ({account: {claims: {decoratedCredentials}}}: RootState): {} => ({
  decoratedCredentials,
})

const mapDispatchToProps = (dispatch: ThunkDispatch): {} => ({
  openExpiredDetails: openExpiredDetails,
})

export const Documents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsContainer)
