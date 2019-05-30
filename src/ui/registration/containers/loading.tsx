import * as React from 'react'
import { connect } from 'react-redux'
import { View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { registrationActions } from 'src/actions'
import * as loading from 'src/actions/registration/loadingStages'
import { RootState } from 'src/reducers/'
import { Container, CenteredText, Block } from 'src/ui/structure/'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import I18n from 'src/locales/i18n'
const loaders = require('react-native-indicator')

export interface ConnectProps {
  loadingMsg: string
  createIdentity: (encodedEntropy: string) => void
}

interface Props extends ConnectProps {}

export interface State {}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-start',
    marginBottom: '10%',
  },
  loadingMsg: {
    alignSelf: 'flex-end',
    marginBottom: '-10%',
  },
  container: {
    backgroundColor: JolocomTheme.primaryColorBlack,
    height: '100%',
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  dotActive: {
    marginRight: 8,
    marginLeft: 8,
    color: JolocomTheme.primaryColorSand,
  },
  dotInactive: {
    marginRight: 5,
    marginLeft: 5,
    color: JolocomTheme.primaryColorGrey,
  },
  text: {
    color: JolocomTheme.primaryColorSand,
    fontSize: 20,
    fontFamily: JolocomTheme.contentFontFamily,
  },
  smallText: {
    color: JolocomTheme.primaryColorSand,
    fontSize: 14,
    fontFamily: JolocomTheme.contentFontFamily,
  },
})

// TODO SFC
export class LoadingContainer extends React.Component<Props, State> {
  render() {
    return (
      <Container style={styles.container}>
        <Block style={styles.label}>
          <CenteredText
            style={styles.text}
            msg={I18n.t('Give us a few moments')}
          />
          <CenteredText
            style={styles.text}
            msg={I18n.t('to set up your identity')}
          />
        </Block>
        <Block>
          <loaders.RippleLoader
            size={80}
            strokeWidth={4}
            color={JolocomTheme.spinnerColor}
          />
        </Block>
        <Block style={styles.loadingMsg}>
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((prop, key) => {
              const stageNumber = loading.loadingStages.indexOf(
                this.props.loadingMsg,
              )
              return (
                <Icon
                  name="circle"
                  size={prop <= stageNumber ? 15 : 10}
                  style={
                    prop <= stageNumber ? styles.dotActive : styles.dotInactive
                  }
                  key={prop}
                />
              )
            })}
          </View>
          <View>
            <CenteredText
              style={styles.smallText}
              msg={this.props.loadingMsg}
            />
          </View>
        </Block>
      </Container>
    )
  }
}

const mapStateToProps = ({registration: {loading: {loadingMsg}}}: RootState) => {
  return {
    loadingMsg
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  createIdentity: (entropy: string) =>
    dispatch(registrationActions.createIdentity(entropy)),
})

export const Loading = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LoadingContainer)
