import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { Container } from 'src/ui/structure'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Button } from 'react-native-material-ui'
import { QrScanEvent } from 'src/ui/generic/qrcodeScanner'
import { navigationActions } from 'src/actions'
import I18n from 'src/locales/i18n'
import { LoadingSpinner } from './loadingSpinner'
import { JolocomLib } from 'jolocom-lib'
import { interactionHandlers } from '../../lib/storage/interactionTokens'
import { AnyAction } from 'redux'
import { ThunkAction } from '../../store'
import { showErrorScreen } from '../../actions/generic'
import {RootState} from '../../reducers'
const QRScanner = require('react-native-qrcode-scanner').default

export interface QrScanEvent {
  data: string
}

interface Props {
  loading: boolean
  onScannerSuccess: (e: QrScanEvent) => ThunkAction
  onScannerCancel: () => AnyAction
}

interface State {}

const styles = StyleSheet.create({
  buttonText: {
    color: JolocomTheme.primaryColorBlack,
  },
})

export class QRcodeScanner extends React.Component<Props, State> {
  render() {
    const { loading, onScannerSuccess, onScannerCancel } = this.props
    return (
      <React.Fragment>
        {loading && <LoadingSpinner />}
        <Container>
          <QRScanner
            onRead={(e: QrScanEvent) => onScannerSuccess(e)}
            topContent={<Text>{I18n.t('You can scan the qr code now!')}</Text>}
            bottomContent={
              <Button
                onPress={onScannerCancel}
                style={{ text: styles.buttonText }}
                text={I18n.t('Cancel')}
              />
            }
          />
        </Container>
      </React.Fragment>
    )
  }
}

const mapStateToProps = ({account: {loading: {loading}}}: RootState) => ({
  loading
})

const mapDispatchToProps = (dispatch: Function) => ({
  onScannerSuccess: (e: QrScanEvent) => {
    const interactionToken = JolocomLib.parse.interactionToken.fromJWT(e.data)
    const handler = interactionHandlers[interactionToken.interactionType]

    return handler
      ? dispatch(handler(interactionToken))
      : dispatch(showErrorScreen(new Error('No handler found')))
  },
  onScannerCancel: () => dispatch(navigationActions.goBack()),
})

export const QRScannerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(QRcodeScanner)
