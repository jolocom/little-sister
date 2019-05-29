import React from 'react'
import { connect } from 'react-redux'
import { View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'

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
  claims: ClaimsState
  loading: boolean
  scrollHideNav: (event?: NativeSyntheticEvent<NativeScrollEvent>) => void
}

interface Props extends ConnectProps {}

export class ClaimsContainer extends React.Component<Props> {
  componentWillMount() {
    this.props.setClaimsForDid()
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CredentialOverview
          did={this.props.did}
          claimsState={this.props.claims}
          loading={!!this.props.claims.loading}
          onEdit={this.props.openClaimDetails}
          scrollHideNav={this.props.scrollHideNav}
        />
      </View>
    )
  }
}

// TODO nicer pattern for accessing state, perhaps immer or something easier to Type
const mapStateToProps = (state: any) => ({
  did: state.account.did.toJS().did,
  claims: state.account.claims.toJS(),
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
