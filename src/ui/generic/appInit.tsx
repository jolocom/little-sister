import * as React from 'react'
import { connect } from 'react-redux'

import { ThunkDispatch } from 'src/store'
import { Dimensions, Image, StyleSheet, Text } from 'react-native'
import { withErrorHandler } from 'src/actions/modifiers'
import { Wrapper } from '../structure'
import { AppError, ErrorCode } from 'src/lib/errors'
import { showErrorScreen, initApp } from 'src/actions/generic'
import { Typography, Colors } from 'src/styles'
const image = require('src/resources/img/splashScreen.png')

interface Props extends ReturnType<typeof mapDispatchToProps> {}

const styles = StyleSheet.create({
  loadingText: {
    position: 'absolute',
    bottom: '5%',
    ...Typography.baseFontStyles,
    fontSize: Typography.text3XS,
    color: Colors.sandLight070,
    textAlign: 'center',
  },
})

export class AppInitContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.props.doAppInit()
  }

  render() {
    const viewWidth: number = Dimensions.get('window').width
    const viewHeight: number = Dimensions.get('window').height

    return (
      <Wrapper dark>
        <Image
          source={image}
          style={{
            bottom: '15%',
            width: viewWidth,
            height: viewHeight / 2,
          }}
        />
        <Text style={styles.loadingText}>POWERED BY JOLOCOM</Text>
      </Wrapper>
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  doAppInit: () => dispatch(
    withErrorHandler(
      showErrorScreen,
      (err: Error) => new AppError(ErrorCode.AppInitFailed, err)
    )(initApp)
  )
})

export const AppInit = connect(
  null,
  mapDispatchToProps,
)(AppInitContainer)
