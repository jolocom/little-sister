import React from 'react'
import { InteractionsComponent } from 'src/ui/home/components/interactions'
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

export class InteractionsContainer extends React.Component<Props, State> {
  state = {}

  render() {
    return <InteractionsComponent />
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

export const Interactions = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InteractionsContainer)
