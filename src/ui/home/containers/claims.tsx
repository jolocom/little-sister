import React from 'react'
import { connect } from 'react-redux'
import { CredentialOverview } from '../components/credentialOverview'
import { accountActions } from 'src/actions'
import { DecoratedClaims } from 'src/reducers/account/'
import { RootState } from '../../../reducers'
import { withLoading } from '../../../actions/modifiers'
import { ThunkDispatch } from '../../../store'
import { Wrapper } from 'src/ui/structure'

export interface ClaimsContainerProps
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

export const ClaimsContainer = (props: ClaimsContainerProps) => {
  const { did, claimsState, openClaimDetails } = props

  return (
    <Wrapper testID="claimsScreen">
      <CredentialOverview
        did={did}
        claimsToRender={claimsState.decoratedCredentials}
        onEdit={openClaimDetails}
      />
    </Wrapper>
  )
}

const mapStateToProps = ({
  account: {
    did: { did },
    claims: claimsState,
  },
}: RootState) => ({ did, claimsState })

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  openClaimDetails: (claim: DecoratedClaims) =>
    dispatch(accountActions.openClaimDetails(claim)),
  setClaimsForDid: () => dispatch(withLoading(accountActions.setClaimsForDid)),
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
