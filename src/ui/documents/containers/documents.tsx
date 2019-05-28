import React from 'react'
import { DocumentsComponent } from 'src/ui/documents/components/documents'
import { connect } from 'react-redux'
import { openExpiredDetails } from 'src/actions/documents'
import { CategorizedClaims, DecoratedClaims } from 'src/reducers/account'
import { getDocumentClaims } from 'src/utils/filterDocuments'

interface ConnectProps {
  decoratedCredentials: CategorizedClaims
  openExpiredDetails: (document: DecoratedClaims) => void
}

interface Props extends ConnectProps {}

interface State {}

export class DocumentsContainer extends React.Component<Props, State> {
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
      />
    )
  }
}

const mapStateToProps = (state: any): {} => ({
  decoratedCredentials: state.account.claims.toJS().decoratedCredentials,
})

const mapDispatchToProps = (dispatch: Function): {} => ({
  openExpiredDetails: (document: DecoratedClaims) =>
    dispatch(openExpiredDetails(document)),
})

export const Documents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsContainer)
