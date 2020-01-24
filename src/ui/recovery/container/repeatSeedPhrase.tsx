import * as React from 'react'
import RepeatSeedPhraseComponent from '../components/repeatSeedPhrase'
import { ThunkDispatch } from '../../../store'
import { navigationActions, recoveryActions } from '../../../actions'
import { connect } from 'react-redux'
import strings from '../../../locales/strings'
import * as I18n from 'i18n-js'
import { NavigationScreenProps } from 'react-navigation'
import { routeList } from '../../../routeList'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    NavigationScreenProps {}

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
      this.props.onFinish()
    } else {
      this.setState({
        sorting: {},
        randomWords: Object.keys(sorting).map(key => sorting[key]),
        note: `${I18n.t(strings.THE_ORDER_WAS_NOT_CORRECT)}. ${
          strings.TRY_AGAIN_WITH_ANOTHER_SIX_WORDS_FROM_YOUR_SECURE_PHRASE
        }.`,
      })
    }
  }

  public getRandomWords(): string[] {
    const mnemonic = this.props.navigation.getParam('mnemonic')
    const randomWords = []
    const mnemonicArray = mnemonic.split(' ')
    while (mnemonicArray.length > 6 && randomWords.length < 6) {
      const random = Math.floor(Math.random() * mnemonicArray.length)
      if (randomWords.indexOf(mnemonicArray[random]) === -1) {
        randomWords.push(mnemonicArray[random])
      }
    }
    return randomWords
  }

  public componentDidMount(): void {
    const randomWords = this.getRandomWords()
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
  onFinish: () => {
    dispatch(recoveryActions.setSeedPhraseSaved())
    return dispatch(
      navigationActions.navigate({ routeName: routeList.BackupOffer }),
    )
  },
})

export const RepeatSeedPhrase = connect(
  null,
  mapDispatchToProps,
)(RepeatSeedPhraseContainer)
