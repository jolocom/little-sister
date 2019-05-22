import React from 'react'
import { DocumentsComponent } from 'src/ui/documents/components/documents'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers/'
import { openExpiredDetails } from 'src/actions/documents'
import { Document } from 'src/ui/documents/components/documentCard'

interface ConnectProps {
  // selectedExpiredDocument: Document | {}
  // // setExpiredDocument: (document: Document) => void
  // clearExpiredDocument: () => void
  openExpiredDetails: (document: Document) => void
}

interface Props extends ConnectProps {}

interface State {}

export class DocumentsContainer extends React.Component<Props, State> {
  public render(): JSX.Element {
    return (
      <DocumentsComponent openExpiredDetails={this.props.openExpiredDetails} />
    )
  }
}

const mapStateToProps = (state: RootState): {} => ({
  // selectedExpiredDocument: state.documents.selectedExpiredDocument,
})

const mapDispatchToProps = (dispatch: Function): {} => ({
  // setExpiredDocument: (document: Document) =>
  // clearExpiredDocument: () => dispatch(clearSelectedExpiredDocument()),
  openExpiredDetails: (document: Document) =>
    dispatch(openExpiredDetails(document)),
})

export const Documents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsContainer)
