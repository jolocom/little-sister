import React from 'react'
import { connect } from 'react-redux'
import { LandingComponent } from 'src/ui/landing/components/landing'
import { ThunkDispatch } from 'src/store'
import { routeList } from '../../../routeList'
import { checkTermsOfService } from 'src/actions/generic'
import { withErrorScreen } from 'src/actions/modifiers'
import { registrationActions } from 'src/actions/'
import { AppError, ErrorCode } from 'src/lib/errors'
import useDisableBackButton from 'src/ui/deviceauth/hooks/useDisableBackButton'
import { NavigationInjectedProps } from 'react-navigation'

interface Props extends ReturnType<typeof mapDispatchToProps>,
  NavigationInjectedProps {}

export const LandingContainer = (props: Props) => {
  useDisableBackButton(() => {
    // return true (disable back button) if we are focused
    return props.navigation?.isFocused()
  })

  return (
    <LandingComponent
      handleGetStarted={props.getStarted}
      handleRecover={props.recoverIdentity}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  getStarted: () => {
    dispatch(
      withErrorScreen(
        checkTermsOfService(routeList.RegistrationProgress, () => {
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
        checkTermsOfService(routeList.InputSeedPhrase),
        err =>
          new AppError(ErrorCode.RegistrationFailed, err, routeList.Landing),
      ),
    )
  },
})

export const Landing = connect(null, mapDispatchToProps)(LandingContainer)
