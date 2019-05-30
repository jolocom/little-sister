import React from 'react'
import { ClaimDetailsComponent } from 'src/ui/home/components/claimDetails'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers/'
import { accountActions } from 'src/actions'
import { ClaimsState } from 'src/reducers/account'

interface ConnectProps {
  claims: ClaimsState
  saveClaim: () => void
  handleClaimInput: (fieldValue: string, fieldName: string) => void
}

interface Props extends ConnectProps {}

interface State {}

export class ClaimDetailsContainer extends React.Component<Props, State> {
  render() {
    return (
      <ClaimDetailsComponent
        saveClaim={this.props.saveClaim}
        handleClaimInput={this.props.handleClaimInput}
        selectedClaim={this.props.claims.selected}
      />
    )
  }
}

const mapStateToProps = ({account: {claims}}: RootState) => {
  return {
    claims,
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  saveClaim: () => {
    dispatch(accountActions.saveClaim())
  },
  handleClaimInput: (fieldValue: string, fieldName: string) => {
    dispatch(accountActions.handleClaimInput(fieldValue, fieldName))
  },
})

export const ClaimDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimDetailsContainer)
