import React from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { Container, JolocomButton } from 'src/ui/structure'
import { ThunkDispatch } from 'src/store'
import { NavigationScreenProps } from 'react-navigation'
import { Colors } from 'src/styles'
import { BleManager } from 'react-native-ble-plx'
import { openSerialConnection, BleSerialConnectionConfig } from 'src/lib/ble'
import { showErrorScreen } from 'src/actions/generic'
import { JolocomLib } from 'jolocom-lib'
import { AppError, ErrorCode } from 'src/lib/errors'
import { interactionHandlers } from 'src/lib/storage/interactionTokens'
import { withLoading, withErrorScreen } from 'src/actions/modifiers'
import { connectToBleDevice } from 'src/actions/interactions'

import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'
import { RootState } from 'src/reducers';

interface Props
  extends ReturnType<typeof mapDispatchToProps>, ReturnType<typeof mapStateToProps>,
  NavigationScreenProps { }

interface State {
  devices: {
    [id: string]: string
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundLightMain,
  },
  buttonText: {
    color: Colors.blackMain,
  },
})

export class BLECodeScanner extends React.Component<Props, State> {
  private removeFocusListener: (() => void) | undefined
  private ble: BleManager

  constructor(props: Props) {
    super(props)
    this.ble.startDeviceScan(
      [serialUUIDs.serviceUUID],
      null,
      (error, device) => {
        if (error) console.log(error.toString())

        if (device && device.name) {
          this.setState({
            devices: {
              ...this.state.devices,
              [device.id]: device.name,
            },
          })
        }
      },
    )
  }

  componentWillUnmount() {
    if (this.removeFocusListener) this.removeFocusListener()
  }

  onScannerCancel() {
    if (this.props.navigation) this.props.navigation.goBack()
  }

  render() {
    const devices = this.props.bleDevices
    return (
      <React.Fragment>
        <Container style={styles.container}>
          <FlatList
            data={Object.keys(devices).map(id => ({
              name: devices[id],
              id,
            }))}
            renderItem={({ item }) => (
              <JolocomButton
                text={item.name}
                onPress={() => this.props.connectToDevice(item)}
              />
            )}
          />
        </Container>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  bleDevices: state.ble.devices
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  connectToDevice: device => dispatch(connectToBleDevice(device)),
  onScannerSuccess: (
    send: (token: JSONWebToken<JWTEncodable>) => Promise<any>,
  ) => async (e: string) => {
    let interactionToken
    try {
      interactionToken = JolocomLib.parse.interactionToken.fromJWT(e)
    } catch (err) {
      return dispatch(
        showErrorScreen(new AppError(ErrorCode.ParseJWTFailed, err)),
      )
    }
    const handler = interactionHandlers[interactionToken.interactionType]
    return handler
      ? dispatch(withLoading(withErrorScreen(handler(interactionToken, send))))
      : dispatch(
          showErrorScreen(
            new AppError(ErrorCode.Unknown, new Error('No handler found')),
          ),
        )
  },
})

export const BLEScannerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BLECodeScanner)
