import * as React from 'react'
import { connect } from 'react-redux'

import { ThunkDispatch } from '../../store'
import { Image } from 'react-native'
import { withErrorHandler } from '../../actions/modifiers'
import { Wrapper } from '../structure'
import { AppError, ErrorCode } from '../../lib/errors'
import { showErrorScreen } from '../../actions/generic'
import { initApp } from 'src/actions/generic/init'

interface Props extends ReturnType<typeof mapDispatchToProps> {}

export class AppInitContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.props.doAppInit()
  }

  render() {
    return (
      <Wrapper dark withoutSafeArea centered>
        <Image
          source={require('src/resources/img/splashIcons/joloLogoIcon.png')}
        />
      </Wrapper>
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  doAppInit: () =>
    dispatch(
      withErrorHandler(
        showErrorScreen,
        (err: Error) => new AppError(ErrorCode.AppInitFailed, err),
      )(initApp),
    ),
})

export const AppInit = connect(null, mapDispatchToProps)(AppInitContainer)
