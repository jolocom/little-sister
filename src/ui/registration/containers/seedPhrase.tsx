import React from 'react'
import { connect } from 'react-redux'
import { SeedPhrase as SeedPhraseComponent } from 'src/ui/registration/components/seedPhrase'
import { finishRegistration } from 'src/actions/registration'
import { ThunkDispatch } from '../../../store'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps> {
  navigation: { state: { params: any } } // TODO Type?
}

interface State {
  checked: boolean
}

export class SeedPhraseContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      checked: false,
    }
  }

  render() {
    const { mnemonic } = this.props.navigation.state.params
    return (
      <SeedPhraseComponent
        seedPhrase={mnemonic}
        checked={this.state.checked}
        handleButtonTap={this.props.finishRegistration}
      />
    )
  }
}

const mapStateToProps = () => ({})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  finishRegistration: () => dispatch(finishRegistration),
})

export const SeedPhrase = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SeedPhraseContainer)
