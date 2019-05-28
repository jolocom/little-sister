import React from 'react'
import { connect } from 'react-redux'
import { View } from 'react-native'

import { CredentialOverview } from '../components/credentialOverview'
import { accountActions } from 'src/actions'
import { ClaimsState } from 'src/reducers/account'
import { DecoratedClaims } from 'src/reducers/account/'

interface ConnectProps {
  setClaimsForDid: () => void
  openClaimDetails: (claim: DecoratedClaims) => void
  did: string
  claims: ClaimsState
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
          loading={this.props.claims.loading}
          onEdit={this.props.openClaimDetails}
        />
      </View>
    )
  }
}

// TODO nicer pattern for accessing state, perhaps immer or something easier to Type
const mapStateToProps = (state: any) => ({
  did: state.account.did.toJS().did,
  claims: state.account.claims.toJS(),
})

const mapDispatchToProps = (dispatch: Function) => ({
  openClaimDetails: (claim: DecoratedClaims) =>
    dispatch(accountActions.openClaimDetails(claim)),
  setClaimsForDid: () => dispatch(accountActions.setClaimsForDid()),
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
