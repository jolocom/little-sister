import React from 'react'
import { StyleSheet, Text } from 'react-native'
import { Wrapper } from 'src/ui/structure/'
import { MaskedImageComponent } from 'src/ui/registration/components/maskedImage'
import I18n from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Typography, Colors } from 'src/styles'
import { HandAnimationComponent } from './handAnimation'

interface Props {
  addPoint: (x: number, y: number) => void
  readonly progress: number
}

const styles = StyleSheet.create({
  text: {
    ...Typography.subMainText,
    textAlign: 'center',
    color: Colors.sandLight,
    position: 'absolute',
    top: '20%',
    paddingHorizontal: '5%',
  },
  bigFont: {
    fontSize: Typography.text4XL,
  },
})

export const EntropyComponent: React.FC<Props> = props => {
  const { progress, addPoint } = props

  const msg =
    progress === 0
      ? I18n.t(strings.FOR_SECURITY_PURPOSES_WE_NEED_SOME_RANDOMNESS) +
        '. ' +
        I18n.t(strings.PLEASE_TAP_THE_SCREEN_AND_DRAW_ON_IT_RANDOMLY)
      : `${Math.trunc(progress * 100)} %`

  const textStyle = progress === 0 ? styles.text : [styles.text, styles.bigFont]

  return (
    <>
      <Wrapper breathy overlay withoutSafeArea>
        <MaskedImageComponent disabled={progress === 1} addPoint={addPoint} />
      </Wrapper>
      <Wrapper dark centered withoutSafeArea withoutStatusBar>
        <Text testID="entropyMsg" style={textStyle}>
          {msg}
        </Text>
        {progress === 0 && <HandAnimationComponent />}
      </Wrapper>
    </>
  )
}
