import React from 'react'
import { connect } from 'react-redux'

import { CredentialOverview } from '../components/credentialOverview'
import { accountActions } from 'src/actions'
import { DecoratedClaims } from 'src/reducers/account/'
import { RootState } from '../../../reducers'
import { ThunkDispatch } from '../../../store'
import { Wrapper } from 'src/ui/structure'
import useDisableBackButton from 'src/ui/deviceauth/hooks/useDisableBackButton'
import { NavigationInjectedProps } from 'react-navigation'

export interface ClaimsContainerProps
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationInjectedProps {}

export const ClaimsContainer = (props: ClaimsContainerProps) => {
  const { did, claimsState, openClaimDetails } = props

  useDisableBackButton(() => {
    // return true (disable back button) if we are focused
    return props.navigation?.isFocused()
  })


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
})

export const Claims = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimsContainer)
