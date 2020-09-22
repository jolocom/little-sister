import React from 'react'
import { connect } from 'react-redux'
import { LandingComponent } from 'src/ui/landing/components/landing'
import { ThunkDispatch } from 'src/store'
import { routeList } from '../../../routeList'
import { checkTermsOfService } from 'src/actions/generic'
import { withErrorScreen } from 'src/actions/modifiers'
import { navigationActions, registrationActions } from 'src/actions/'
import { AppError, ErrorCode } from 'src/lib/errors'

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
  getStarted: () => {
    dispatch(
      withErrorScreen(
        checkTermsOfService(() => {
          dispatch(
            navigationActions.navigate({
              routeName: routeList.RegistrationProgress,
            }),
          )
          dispatch(
            withErrorScreen(
              registrationActions.createIdentity(''),
              err =>
                new AppError(
                  ErrorCode.RegistrationFailed,
                  err,
                  routeList.Landing,
                ),
            ),
          )
        }),
      ),
    )
  },
  recoverIdentity: () => {
    dispatch(
      withErrorScreen(
        checkTermsOfService(() => {
          dispatch(
            navigationActions.navigate({
              routeName: routeList.InputSeedPhrase,
            }),
          )
        }),
        err =>
          new AppError(ErrorCode.RegistrationFailed, err, routeList.Landing),
      ),
    )
  },
})

export const Landing = connect(null, mapDispatchToProps)(LandingContainer)
