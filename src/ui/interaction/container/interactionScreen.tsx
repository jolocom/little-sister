import {
  JSONWebToken,
  JWTEncodable,
} from 'jolocom-lib/js/interactionTokens/JSONWebToken'

import React from 'react'
import { connect } from 'react-redux'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { NavigationInjectedProps } from 'react-navigation'

import { ThunkDispatch } from 'src/store'
import { CloseIcon } from 'src/resources'
import { AppError, ErrorCode } from 'src/lib/errors'
import { interactionHandlers } from 'src/lib/storage/interactionTokens'

import { Wrapper } from 'src/ui/structure'
import { white } from 'src/styles/colors'
import { fontMain, textXXS } from 'src/styles/typography'
import { showErrorScreen } from 'src/actions/generic'
import { withErrorScreen, withLoading } from 'src/actions/modifiers'
import { navigateBack } from 'src/actions/navigation'

import { ScannerContainer } from './scanner'

const IS_IOS = Platform.OS === 'ios'

const styles = StyleSheet.create({
  iconWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    fontFamily: fontMain,
    fontSize: textXXS,
    color: white,
    position: 'absolute',
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    NavigationInjectedProps {}

const InteractionContainer = (props: Props) => {
  return (
    <Wrapper dark centered withoutSafeArea withoutStatusBar>
      {IS_IOS && (
        <TouchableOpacity
          onPress={props.navigateHome}
          style={styles.closeButton}
        >
          <CloseIcon />
        </TouchableOpacity>
      )}
      <ScannerContainer
        navigation={props.navigation}
        onScannerSuccess={props.onScannerSuccess}
      />
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  onScannerSuccess: async (interactionToken: JSONWebToken<JWTEncodable>) => {
    const handler = interactionHandlers[interactionToken.interactionType]

    return handler
      ? dispatch(withLoading(withErrorScreen(handler(interactionToken))))
      : dispatch(
          showErrorScreen(
            new AppError(ErrorCode.Unknown, new Error('No handler found')),
          ),
        )
  },
  navigateHome: () => dispatch(navigateBack()),
})

export const InteractionScreen = connect(
  null,
  mapDispatchToProps,
)(InteractionContainer)
