import React from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import InputSeedPhraseComponent from '../components/inputSeedPhrase'
import { validateMnemonic, wordlists } from 'bip39'
import { withErrorScreen, withLoading } from '../../../actions/modifiers'
import { recoverIdentity } from '../../../actions/registration'
import { AppError } from '../../../lib/errors'
import { routeList } from '../../../routeList'
import ErrorCode from '../../../lib/errorCodes'
import { StatusBar } from 'react-native'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

interface State {
  value: string
  isValid: boolean
  wordList: string[]
}
function getLastWord(phrase: string): string {
  phrase = phrase.trim()
  if (phrase.indexOf(' ') !== -1) {
    return phrase
      .slice(phrase.lastIndexOf(' '), phrase.length)
      .trim()
      .toLowerCase()
  } else return phrase.toLowerCase()
}
export class InputSeedPhraseContainer extends React.Component<Props, State> {
  public state = {
    value: '',
    isValid: false,
    wordList: [] as string[],
  }

  private handleSeedPhraseChange = (text: string): void => {
    const lastWord = getLastWord(text)
    let matches = [] as string[]

    if (lastWord.length >= 3) {
      matches = wordlists.EN.filter(
        (word: string): boolean =>
          word.startsWith(lastWord) && word !== lastWord,
      )
    }
    this.setState({
      value: text,
      isValid: validateMnemonic(text.trim()),
      wordList: matches,
    })
  }

  private selectWord = (index: number): void => {
    const { wordList, value } = this.state
    const newValue =
      value.indexOf(' ') !== -1
        ? value.slice(0, value.lastIndexOf(' ')) + ' ' + wordList[index] + ' '
        : wordList[index] + ' '
    this.setState({
      value: newValue,
      isValid: validateMnemonic(newValue),
      wordList: [],
    })
  }
  public render(): JSX.Element {
    return (
      <React.Fragment>
        <StatusBar />
        <InputSeedPhraseComponent
          value={this.state.value}
          isValid={this.state.isValid}
          wordList={this.state.wordList}
          selectWord={this.selectWord}
          handleTextInput={this.handleSeedPhraseChange}
          handleButtonPress={() => this.props.recoverIdentity(this.state.value)}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = () => ({})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  recoverIdentity: (seedPhrase: string) =>
    dispatch(
      withErrorScreen(withLoading(recoverIdentity(seedPhrase)), err => {
        if (err instanceof AppError) {
          err.navigateTo = routeList.InputSeedPhrase
          return err
        }
        return new AppError(ErrorCode.Unknown, err)
      }),
    ),
})

export const InputSeedPhrase = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InputSeedPhraseContainer)
