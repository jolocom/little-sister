import * as React from 'react'
import RepeatSeedPhraseComponent from '../components/repeatSeedPhrase'
import { ThunkDispatch } from '../../../store'
import { navigationActions, recoveryActions } from '../../../actions'
import { connect } from 'react-redux'
import { withLoading } from '../../../actions/modifiers'
import strings from '../../../locales/strings'
import * as I18n from 'i18n-js'
import { NavigationInjectedProps } from 'react-navigation'
import { routeList } from '../../../routeList'
import { Vibration } from 'react-native'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    NavigationInjectedProps {}

interface State {
  note: string
  sorting: {}
  randomWords: string[]
}

export class RepeatSeedPhraseContainer extends React.Component<Props, State> {
  public state = {
    note: I18n.t(
      strings.IF_YOU_HAVE_NOTED_DOWN_YOUR_PHRASE_PUT_THE_SIX_GIVEN_WORDS_ON_THEIR_RIGHT_PLACES,
    ),
    sorting: {},
    randomWords: [] as string[],
  }

  private selectPosition = (id: number) => {
    const { sorting, randomWords } = this.state
    if (sorting[id]) {
      randomWords.unshift(sorting[id])
      delete sorting[id]
    } else {
      const currentWord = randomWords[0]
      randomWords.shift()
      sorting[id] = currentWord
    }

    this.setState({
      sorting,
      randomWords,
    })
  }

  private checkMnemonic = () => {
    const { sorting } = this.state
    const mnemonic = this.props.navigation.getParam('mnemonic')
    let isCorrect = true
    const mnemonicArray = mnemonic.split(' ')
    Object.keys(sorting).forEach(key => {
      if (mnemonicArray[key] !== sorting[key]) {
        isCorrect = false
      }
    })

    if (isCorrect) {
      this.props.setSeedPhraseSaved()
    } else {
      Vibration.vibrate(400)
      this.setState({
        sorting: {},
        randomWords: Object.keys(sorting).map(key => sorting[key]),
        note: `${I18n.t(strings.THE_ORDER_WAS_NOT_CORRECT)}. ${
          strings.TRY_AGAIN_WITH_ANOTHER_SIX_WORDS_FROM_YOUR_SECURE_PHRASE
        }.`,
      })
    }
  }

  public getRandomWords(n: number): string[] {
    const shuffle = (a: string[]) => {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    const mnemonic = this.props.navigation.getParam('mnemonic')
    const mnemonicArray = mnemonic.split(' ')

    return shuffle(mnemonicArray).slice(n)
  }

  public componentDidMount(): void {
    const randomWords = this.getRandomWords(6)
    this.setState({ randomWords })
  }

  public render(): JSX.Element {
    const { note, sorting, randomWords } = this.state
    return (
      <RepeatSeedPhraseComponent
        note={note}
        mnemonicSorting={sorting}
        randomWords={randomWords}
        back={() =>
          this.props.openSeedPhrase(this.props.navigation.getParam('mnemonic'))
        }
        checkMnemonic={this.checkMnemonic}
        selectPosition={this.selectPosition}
      />
    )
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  openSeedPhrase: (mnemonic: string) =>
    dispatch(
      navigationActions.navigate({
        routeName: routeList.SeedPhrase,
        params: { mnemonic },
      }),
    ),
  setSeedPhraseSaved: () => {
    dispatch(withLoading(recoveryActions.setSeedPhraseSaved()))
    return dispatch(navigationActions.navigatorResetHome())
  },
})

export const RepeatSeedPhrase = connect(
  null,
  mapDispatchToProps,
)(RepeatSeedPhraseContainer)
