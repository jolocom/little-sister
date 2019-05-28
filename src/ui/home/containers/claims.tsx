import React from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'
import { CredentialOverview } from '../components/credentialOverview'
import { accountActions, ssoActions, navigationActions } from 'src/actions'
import { ClaimsState } from 'src/reducers/account'
import { DecoratedClaims } from 'src/reducers/account/'
import { routeList } from 'src/routeList'

interface ConnectProps {
  setClaimsForDid: () => void
  toggleLoading: (val: boolean) => void
  openClaimDetails: (claim: DecoratedClaims) => void
  openScanner: () => void
  parseJWT: (jwt: string) => void
  did: string
  claimsState: ClaimsState
  loading: boolean
}

interface Props extends ConnectProps {}

export class ClaimsContainer extends React.Component<Props> {
  componentWillMount() {
    this.props.setClaimsForDid()
  }

  render() {
    const { did, loading, claimsState, openClaimDetails } = this.props
    return (
      <View style={{ flex: 1 }}>
        <CredentialOverview
          did={did}
          claimsToRender={claimsState.decoratedCredentials}
          loading={!!loading}
          onEdit={openClaimDetails}
        />
      </View>
    )
  }
}

// TODO nicer pattern for accessing state, perhaps immer or something easier to Type
const mapStateToProps = (state: any) => ({
  did: state.account.did.toJS().did,
  claimsState: state.account.claims.toJS(),
  loading: state.account.loading.toJS().loading,
})

const mapDispatchToProps = (dispatch: Function) => ({
  parseJWT: (jwt: string) => dispatch(ssoActions.parseJWT(jwt)),
  openClaimDetails: (claim: DecoratedClaims) =>
    dispatch(accountActions.openClaimDetails(claim)),
  setClaimsForDid: () => dispatch(accountActions.setClaimsForDid()),
  toggleLoading: (val: boolean) => dispatch(accountActions.toggleLoading(val)),
  openScanner: () =>
    dispatch(
      navigationActions.navigate({ routeName: routeList.QRCodeScanner }),
    ),
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
