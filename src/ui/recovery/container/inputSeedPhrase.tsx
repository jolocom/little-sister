import React from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import InputSeedPhraseComponent from '../components/inputSeedPhrase'
import { validateMnemonic, wordlists } from 'bip39'
import { withErrorScreen } from '../../../actions/modifiers'
import { recoverIdentity } from '../../../actions/registration'
import { routeList } from '../../../routeList'
import { StatusBar, TextInput } from 'react-native'
import { timeout } from '../../../utils/asyncTimeout'
import { navigationActions } from '../../../actions'
import { RootState } from '../../../reducers'

export enum WordState {
  editing,
  loading,
  valid,
  wrong,
}

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

interface State {
  inputValue: string
  isMnemonicValid: boolean
  suggestions: string[]
  markedWord: number
  inputState: WordState
}


/**
 * We are using a closure here to ensure that the mnemonic value
 * is not accessible at runtime by rogue dependencies, i.e. by traversing
 * the internals of the navigation system or react (@TODO Find an actual attack vector to test the fix against).
 *
 * @dev Please note that updating the mnemonic value from inside the container DOES NOT cause a rerender,
 * since it's not part of the Container state / props.
 */

const ClosureInputSeedPhrase = (mnemonic: string[] = []) => {
  return class InputSeedPhraseContainer extends React.Component<Props, State> {
    private textInput: TextInput | undefined
    public state = {
      inputValue: '',
      isMnemonicValid: false,
      suggestions: [] as string[],
      markedWord: 0, // editing first word
      inputState: WordState.editing,
    }

    public componentDidMount(): void {}

    private handleInputChange = (text: string): void => {
      let matches = [] as string[]
      if (text.length >= 2) {
        matches = wordlists.EN.filter((word: string): boolean =>
          word.startsWith(text.trim()),
        )
      }

      this.setState({
        inputValue: text,
        suggestions: matches.slice(0, 10),
      })
    }

    private onDoneButton = async () => {
      const { suggestions, inputValue } = this.state
      this.setState({
        inputState: WordState.loading,
      })
      await timeout(500)
      const matchingWord = suggestions.find(e => e === inputValue.trim())

      if (matchingWord) {
        this.setState({
          inputState: WordState.valid,
        })
        await timeout(500)
        this.selectWord(matchingWord)
      } else {
        this.setState({
          inputState: WordState.wrong,
        })
      }
    }

    private selectWord = (word: string): void => {
      const { markedWord } = this.state
      const isLastWord = markedWord === mnemonic.length
      mnemonic[markedWord] = word
      const mnemonicValid =
        mnemonic.length === 12 && validateMnemonic(mnemonic.join(' '))
      if (mnemonicValid && this.textInput) {
        this.textInput.blur()
      }
      this.setState({
        inputValue: isLastWord ? '' : word,
        markedWord: isLastWord ? mnemonic.length : markedWord,
        isMnemonicValid: mnemonicValid,
        suggestions: [],
        inputState: WordState.editing,
      })
    }

    private changeMarkedWord(next: boolean) {
      const { markedWord, inputValue } = this.state

      let nextWord = markedWord
      let newValue = inputValue
      if (newValue && newValue !== mnemonic[markedWord]) newValue = ''
      else {
        if (next) {
          nextWord =
            markedWord !== mnemonic.length ? markedWord + 1 : mnemonic.length
        } else {
          nextWord = markedWord !== 0 ? markedWord - 1 : 0
        }
        newValue = nextWord === mnemonic.length ? '' : mnemonic[nextWord]
      }
      this.setState({
        inputValue: newValue,
        markedWord: nextWord,
      })
      this.handleInputChange(newValue)
    }

    private nextWord = () => this.changeMarkedWord(true)
    private previousWord = () => this.changeMarkedWord(false)

    public render(): JSX.Element {
      const {
        inputValue,
        isMnemonicValid,
        suggestions,
        markedWord,
        inputState,
      } = this.state

      return (
        <React.Fragment>
          <StatusBar />
          <InputSeedPhraseComponent
            inputValue={inputValue}
            mnemonic={mnemonic}
            isMnemonicValid={isMnemonicValid}
            suggestions={suggestions}
            markedWord={markedWord}
            inputState={inputState}
            selectWord={this.selectWord}
            handleTextInput={this.handleInputChange}
            handleButtonPress={() =>
              this.props.recoverIdentity(mnemonic.join(' '))
            }
            inputRef={ref => {
              this.textInput = ref
            }}
            handleDoneButton={this.onDoneButton}
            handleNextWord={this.nextWord}
            handlePreviousWord={this.previousWord}
            handleBackButton={this.props.goBack}
            isLoading={this.props.isLoading}
          />
        </React.Fragment>
      )
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.registration.loading.isRegistering,
})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  recoverIdentity: (seedPhrase: string) =>
    dispatch(withErrorScreen(recoverIdentity(seedPhrase))),
  goBack: () =>
    dispatch(navigationActions.navigate({ routeName: routeList.Landing })),
})

export const InputSeedPhrase = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClosureInputSeedPhrase())
