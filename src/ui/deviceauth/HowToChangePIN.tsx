import React from 'react'
import { View } from 'react-native'
import { connect } from 'react-redux'

import I18n from 'src/locales/i18n'

import Header from './components/Header'
import Paragraph, { ParagraphSizes } from './components/Paragraph'
import Btn, { BtnTypes } from './components/Btn'
import AbsoluteBottom from './components/AbsoluteBottom'
import strings from 'src/locales/strings'
import { ThunkDispatch } from 'src/store'
import { Colors } from './colors'
import { BP } from '../../styles/breakpoints'
import { navigationActions } from 'src/actions'
import { routeList } from 'src/routeList'
import RecoveryInstructions from 'src/resources/svg/ForgotPINInstructions'
import { Wrapper } from '../structure'
import PasscodeWrapper from './components/PasscodeWrapper'

interface PropsI {
  handleGoBack: () => void
  handleAccessRestore: () => void
}
const HowToChangePIN: React.FC<PropsI> = ({
  handleGoBack,
  handleAccessRestore,
}) => {
  return (
    <Wrapper
      style={{
        backgroundColor: Colors.black,
      }}>
      <PasscodeWrapper
        customStyles={{
          paddingTop: BP({ small: 20, medium: 30, large: 50 }),
          paddingHorizontal: BP({ small: 16, medium: 20, large: 30 }),
        }}>
        <Header
          color={Colors.white90}
          customStyles={{
            fontSize: BP({ small: 24, medium: 28, large: 28 }),
            lineHeight: BP({ small: 28, medium: 32, large: 32 }),
            alignSelf: 'flex-start',
            textAlign: 'left',
          }}>
          {I18n.t(strings.HOW_TO_CHANGE_PIN)}
        </Header>
        <Paragraph
          color={Colors.white80}
          customStyles={{
            marginTop: BP({ small: 0, medium: 12, large: 24 }),
            fontSize: BP({ small: 16, medium: 18, large: 20 }),
            lineHeight: BP({ small: 18, medium: 20, large: 22 }),
            alignSelf: 'flex-start',
            textAlign: 'left',
          }}>
          {I18n.t(strings.WE_ARE_SORRY_THAT_YOU_FORGOT)}
        </Paragraph>
        <Paragraph
          color={Colors.white80}
          customStyles={{
            fontSize: BP({ small: 16, medium: 18, large: 20 }),
            lineHeight: BP({ small: 18, medium: 20, large: 22 }),
            alignSelf: 'flex-start',
            textAlign: 'left',
            marginTop: BP({ small: 0, medium: 12, large: 24 }),
          }}>
          {I18n.t(strings.YOU_CAN_CHANGE_PIN)}
        </Paragraph>
        <View
          style={{
            transform: [{ scale: BP({ small: 0.7, medium: 1, large: 1 }) }],
            position: 'absolute',
            bottom: BP({ small: -80, medium: -80, large: -50 }),
          }}>
          <RecoveryInstructions />
        </View>
        <AbsoluteBottom customStyles={{ alignSelf: 'center', bottom: 0 }}>
          <Btn onPress={handleAccessRestore}>
            {I18n.t(strings.RESTORE_ACCESS)}
          </Btn>
          <Paragraph
            size={ParagraphSizes.micro}
            color={Colors.white70}
            customStyles={{
              paddingHorizontal: BP({
                small: 10,
                medium: 25,
                large: 25,
              }),
              lineHeight: 15,
            }}>
            {I18n.t(strings.STORING_NO_AFFECT_DATA)}
          </Paragraph>
          <Btn onPress={handleGoBack} type={BtnTypes.secondary}>
            {I18n.t(strings.CANCEL)}
          </Btn>
        </AbsoluteBottom>
      </PasscodeWrapper>
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  handleGoBack: () => dispatch(navigationActions.navigateBack()),
  handleAccessRestore: () => {
    // FIXME replace on stack, so that no going back to instructions??
    dispatch(
      navigationActions.navigate({
        routeName: routeList.InputSeedPhrasePin,
        params: { isPINrecovery: true },
      }),
    )
  },
})

export default connect(null, mapDispatchToProps)(HowToChangePIN)
