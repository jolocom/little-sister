import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import { Container } from 'src/ui/structure'
import { Button } from 'react-native-material-ui'
import { QrScanEvent } from 'src/ui/generic/qrcodeScanner'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import { JolocomLib } from 'jolocom-lib'
import { ThunkDispatch } from 'src/store'
import { showErrorScreen } from 'src/actions/generic'
import { NavigationScreenProps } from 'react-navigation'
import { AppError, ErrorCode } from 'src/lib/errors'
import { Colors } from 'src/styles'
import { navigationActions } from '../../actions'
import { InteractionType } from 'jolocom-lib/js/interactionTokens/types'
import { routeList } from '../../routeList'
import { respond } from 'src/lib/http';

const QRScanner = require('react-native-qrcode-scanner').default

export interface QrScanEvent {
  data: string
}

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    NavigationScreenProps {}

interface State {}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundLightMain,
  },
  buttonText: {
    color: Colors.blackMain,
  },
})

export class QRcodeScanner extends React.Component<Props, State> {
  private scanner: typeof QRScanner
  private readonly removeFocusListener: (() => void) | undefined

  public constructor(props: Props) {
    super(props)
    if (this.props.navigation) {
      this.removeFocusListener = this.props.navigation.addListener(
        'willFocus',
        () => {
          this.scanner.reactivate()
          // NOTE: force an update to force remounting of the Camera
          this.forceUpdate()
        },
      ).remove
    }
  }

  public componentWillUnmount() {
    if (this.removeFocusListener) this.removeFocusListener()
  }

  public onScannerCancel() {
    if (this.props.navigation) this.props.navigation.goBack()
  }

  public render() {
    const { onScannerSuccess } = this.props
    // NOTE: the key is used to invalidate the previously rendered component as
    // we need to rerender and remount the camera to ensure it is properly setup
    const cameraProps = { key: Date.now() }
    return (
      <React.Fragment>
        <Container style={styles.container}>
          <QRScanner
            cameraProps={cameraProps}
            ref={(ref: React.Component) => (this.scanner = ref)}
            onRead={onScannerSuccess}
            cameraStyle={{ overflow: 'hidden' }}
            topContent={
              <Text>{I18n.t(strings.YOU_CAN_SCAN_THE_QR_CODE_NOW)}</Text>
            }
            bottomContent={
              <Button
                onPress={this.onScannerCancel.bind(this)}
                style={{ text: styles.buttonText }}
                text={I18n.t(strings.CANCEL)}
              />
            }
          />
        </Container>
      </React.Fragment>
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  onScannerSuccess: async ({ data }: QrScanEvent) => {
    try {
      const { interactionType } = JolocomLib.parse.interactionToken.fromJWT(
        data,
      )

      const navigationMap = {
        [InteractionType.PaymentRequest]: routeList.PaymentConsent,
        [InteractionType.Authentication]: routeList.AuthenticationConsent,
        [InteractionType.CredentialRequest]: routeList.Consent,
        [InteractionType.CredentialOfferRequest]: routeList.CredentialDialog,
      }

      if (!navigationMap[interactionType]) {
        return dispatch(showErrorScreen(new AppError(ErrorCode.ParseJWTFailed)))
      }

      dispatch(
        navigationActions.navigate({
          routeName: navigationMap[interactionType],
          params: {
            jwt: data,
            send: respond,
          },
          key: 'qrCodeScanner',
        }),
      )
    } catch (err) {
      return dispatch(
        showErrorScreen(new AppError(ErrorCode.ParseJWTFailed, err)),
      )
    }
  },
})

export const QRScannerContainer = connect(
  null,
  mapDispatchToProps,
)(QRcodeScanner)
