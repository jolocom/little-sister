import React from 'react'
import { Button } from 'react-native-material-ui'
import { StyleSheet, View, Dimensions } from 'react-native'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { Block, Container, CenteredText } from 'src/ui/structure/'
import { MaskedImageComponent } from 'src/ui/registration/components/maskedImage'
import I18n from 'src/locales/i18n'

interface Props {
  addPoint: (x: number, y: number) => void
  submitEntropy: () => void
  readonly progress: number
}

const viewWidth: number = Dimensions.get('window').width

// TODO FONT WEIGHT REFERENCE FROM STYLES
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: JolocomTheme.primaryColorBlack,
    padding: 0,
  },
  footerButton: {
    position: 'absolute',
    bottom: '5%',
  },
  text: {
    position: 'absolute',
    top: '20%',
    paddingHorizontal: viewWidth / 15,
    backgroundColor: JolocomTheme.primaryColorBlack,
    fontSize: JolocomTheme.headerFontSize,
    fontFamily: JolocomTheme.contentFontFamily,
    fontWeight: '100',
    color: JolocomTheme.primaryColorSand,
  },
  buttonContainer: {
    width: 164,
    height: 48,
    borderRadius: 4,
    backgroundColor: JolocomTheme.primaryColorPurple,
  },
  buttonText: {
    paddingVertical: 15,
    fontFamily: JolocomTheme.contentFontFamily,
    color: JolocomTheme.primaryColorWhite,
    fontSize: JolocomTheme.headerFontSize,
    fontWeight: '100',
  },
})

export const EntropyComponent: React.SFC<Props> = props => {
  const { progress, submitEntropy, addPoint } = props

  const msg =
    progress === 0
      ? I18n.t('For security purposes, we need some randomness') +
        '. ' +
        I18n.t('Please tap the screen and draw on it randomly')
      : `${Math.trunc(progress * 100)} %`

  return (
    <Container style={styles.mainContainer}>
      <CenteredText style={styles.text} msg={msg} />
      <Block>
        <MaskedImageComponent addPoint={addPoint} />
      </Block>
      <View style={styles.footerButton}>
        {progress === 1 ? (
          <Button
            style={{
              container: styles.buttonContainer,
              text: styles.buttonText,
            }}
            upperCase={false}
            raised={true}
            text={I18n.t('Continue')}
            onPress={submitEntropy}
          />
        ) : null}
      </View>
    </Container>
  )
}
