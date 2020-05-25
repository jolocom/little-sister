import React from 'react'
import { connect } from 'react-redux'
import { LandingComponent } from 'src/ui/landing/components/landing'
import { navigationActions } from 'src/actions/'
import { ThunkDispatch } from 'src/store'
import { routeList } from '../../../routeList'

interface Props extends ReturnType<typeof mapDispatchToProps> {}

export class LandingContainer extends React.Component<Props> {
  public render(): JSX.Element {
    return (
      <LandingComponent
        handleGetStarted={this.props.getStarted}
        handleRecover={this.props.recoverIdentity}
      />
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  getStarted: () =>
    dispatch(
      navigationActions.navigate({
        routeName: routeList.Entropy,
      }),
    ),
  recoverIdentity: () =>
    dispatch(
      navigationActions.navigate({
        routeName: routeList.InputSeedPhrase,
      }),
    ),
})

export const Landing = connect(
  null,
  mapDispatchToProps,
)(LandingContainer)
