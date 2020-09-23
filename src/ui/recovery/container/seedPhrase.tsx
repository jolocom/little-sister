import React from 'react'
import { connect } from 'react-redux'
import { SeedPhrase as SeedPhraseComponent } from 'src/ui/recovery/components/seedPhrase'
import { ThunkDispatch } from '../../../store'
import { NavigationInjectedProps } from 'react-navigation'
import { navigationActions } from '../../../actions'
import { routeList } from '../../../routeList'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationInjectedProps {}

export class SeedPhraseContainer extends React.Component<Props> {
  public render() {
    const mnemonic =
      this.props.navigation && this.props.navigation.getParam('mnemonic')
    return (
      <SeedPhraseComponent
        seedPhrase={mnemonic}
        handleButtonTap={() => this.props.repeatSeedPhrase(mnemonic)}
        onBack={this.props.goBack}
      />
    )
  }
}

const mapStateToProps = () => ({})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  repeatSeedPhrase: (mnemonic: string) =>
    dispatch(
      navigationActions.navigate({
        routeName: routeList.RepeatSeedPhrase,
        params: { mnemonic },
      }),
    ),
  goBack: () => dispatch(navigationActions.navigateBack()),
})

export const SeedPhrase = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SeedPhraseContainer)
