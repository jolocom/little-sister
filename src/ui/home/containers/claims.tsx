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
  claimsState: ClaimsState
  loading: boolean
}

interface Props extends ConnectProps {}

export class ClaimsContainer extends React.Component<Props> {
  public componentWillMount(): void {
    this.props.setClaimsForDid()
  }

  public render(): JSX.Element {
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
  openClaimDetails: (claim: DecoratedClaims) =>
    dispatch(accountActions.openClaimDetails(claim)),
  setClaimsForDid: () => dispatch(accountActions.setClaimsForDid()),
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
