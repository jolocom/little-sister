import React from 'react'
import { DocumentsComponent } from 'src/ui/documents/components/documents'
import { connect } from 'react-redux'
import { navigationActions, ssoActions } from 'src/actions'
import { RootState } from 'src/reducers/'
import { routeList } from '../../../routeList'

interface ConnectProps {
  openScanner: () => void
  parseJWT: (jwt: string) => void
  loading: boolean
}

interface Props extends ConnectProps {}

interface State {}

export class DocumentsContainer extends React.Component<Props, State> {
  state = {}

  render() {
    return <DocumentsComponent />
  }
}

const mapStateToProps = (state: RootState) => ({})

const mapDispatchToProps = (dispatch: Function) => ({
  parseJWT: (jwt: string) => dispatch(ssoActions.parseJWT(jwt)),
  openScanner: () =>
    dispatch(
      navigationActions.navigate({ routeName: routeList.QRCodeScanner }),
    ),
})

export const Documents = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DocumentsContainer)
