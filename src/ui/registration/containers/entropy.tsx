import React from 'react'
import { connect } from 'react-redux'
import { registrationActions } from 'src/actions'
import { EntropyComponent } from 'src/ui/registration/components/entropy'
import { RootState } from 'src/reducers'
import {
  EntropyGeneratorInterface,
  EntropyGenerator,
} from 'src/lib/entropyGenerator'
import { generateSecureRandomBytes } from '@jolocom/sdk/js/util'
import { withErrorScreen } from 'src/actions/modifiers'
import { ThunkDispatch } from 'src/store'
import { AppError, ErrorCode } from 'src/lib/errors'
import { routeList } from 'src/routeList'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {}

interface State {
  isDrawn: boolean
  encodedEntropy: string
  sufficientEntropy: boolean
  entropyProgress: number
}

// we are gonna collect some from the user and the rest from the OS
const ENOUGH_ENTROPY_PROGRESS = 0.3
const POST_COLLECTION_WAIT_TIME = 300

export class EntropyContainer extends React.Component<Props, State> {
  private entropyGenerator!: EntropyGeneratorInterface

  public state = {
    isDrawn: false,
    encodedEntropy: '',
    entropyProgress: 0,
    sufficientEntropy: false,
  }

  public componentDidMount(): void {
    this.entropyGenerator = this.setUpEntropyGenerator()
  }

  private setUpEntropyGenerator(): EntropyGeneratorInterface {
    return new EntropyGenerator()
  }

  private addPoint = async (x: number, y: number): Promise<void> => {
    if (this.state.sufficientEntropy) return

    this.entropyGenerator.addFromDelta(x)
    this.entropyGenerator.addFromDelta(y)
    const entropyProgress =
      this.entropyGenerator.getProgress() / ENOUGH_ENTROPY_PROGRESS
    this.setState({ entropyProgress })
    await this.updateEntropyProgress()
  }

  private updateEntropyProgress = async (): Promise<void> => {
    const { entropyProgress } = this.state
    if (entropyProgress >= 1) {
      this.setState({ sufficientEntropy: true, entropyProgress: 1 })
      while (this.entropyGenerator.getProgress() < 1) {
        const moreEntropy = await generateSecureRandomBytes(512)
        // NOTE do not use moreEntropy.forEach, Buffer API is inconsistent, it
        // doesn't work in some envirtonments
        for (let i = 0; i < moreEntropy.length; i++) {
          this.entropyGenerator.addFromDelta(moreEntropy[i])
        }
      }
      const encodedEntropy = this.generateRandomString()
      this.setState({ encodedEntropy })
      setTimeout(this.submitEntropy, POST_COLLECTION_WAIT_TIME)
    }
  }

  private generateRandomString = (): string =>
    this.entropyGenerator.generateRandomString(4)

  private submitEntropy = (): void => {
    this.props.submit(this.state.encodedEntropy)
  }

  public render(): JSX.Element {
    return (
      <EntropyComponent
        addPoint={this.addPoint}
        progress={this.state.entropyProgress}
      />
    )
  }
}

const mapStateToProps = (state: RootState) => ({})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  submit: (encodedEntropy: string) =>
    dispatch(
      withErrorScreen(
        registrationActions.createIdentity(encodedEntropy),
        err =>
          new AppError(ErrorCode.RegistrationFailed, err, routeList.Landing),
      ),
    ),
})

export const Entropy = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EntropyContainer)
