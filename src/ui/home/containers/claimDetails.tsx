import React from 'react'
import { ClaimDetailsComponent } from 'src/ui/home/components/claimDetails'
import { connect } from 'react-redux'
import { RootState } from 'src/reducers/'
import { accountActions, navigationActions } from 'src/actions'
import { ThunkDispatch } from 'src/store'
import { withLoading, withErrorScreen } from 'src/actions/modifiers'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

interface State {}

export class ClaimDetailsContainer extends React.Component<Props, State> {
  render() {
    return (
      <ClaimDetailsComponent
        onBackPress={this.props.onBackPress}
        saveClaim={this.props.saveClaim}
        handleClaimInput={this.props.handleClaimInput}
        selectedClaim={this.props.claims.selected}
      />
    )
  }
}

const mapStateToProps = ({ account: { claims } }: RootState) => ({
  claims,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  onBackPress: () => dispatch(navigationActions.navigateBack()),
  saveClaim: () =>
    dispatch(withLoading(withErrorScreen(accountActions.saveClaim))),
  handleClaimInput: (fieldValue: string, fieldName: string) => {
    dispatch(accountActions.handleClaimInput(fieldValue, fieldName))
  },
})

export const ClaimDetails = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClaimDetailsContainer)
