import React from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import InputSeedPhraseComponent from '../components/inputSeedPhrase'
import { recoverIdentity } from '../../../actions/registration'
import { RootState } from '../../../reducers'
import { navigationActions, recoveryActions } from 'src/actions'
import { NavigationInjectedProps } from 'react-navigation'
import { routeList } from '../../../routeList'

import RecoveryContextProvider from '../components/inputSeedPhrase/module/recoveryContext'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationInjectedProps {}

export class InputSeedPhraseContainer extends React.Component<Props, {}> {
  private onSubmit = async (mnemonic: string[]) => {
    const { state } = this.props.navigation
    if (state.params && state.params.isPINrecovery) {
      this.props.handleRestoreAccess(mnemonic)
    } else {
      this.props.recoverIdentity(mnemonic.join(' '))
    }
  }

  private onCancel = () => {
    const { state } = this.props.navigation
    if (state.params && state.params.isPINrecovery) {
      this.props.goBack()
    } else {
      this.props.goToLanding()
    }
  }

  public render(): JSX.Element {
    return (
      <RecoveryContextProvider>
        <InputSeedPhraseComponent
          handleSubmit={this.onSubmit}
          handleCancel={this.onCancel}
          isLoading={this.props.isLoading}
        />
      </RecoveryContextProvider>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.registration.loading.isRegistering,
  seedPhraseSaved: state.settings.seedPhraseSaved,
})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  recoverIdentity: (mnemonic: string) => {
    dispatch(recoverIdentity(mnemonic))
  },
  goBack: () => dispatch(navigationActions.navigateBack()),
  goToLanding: () =>
    dispatch(navigationActions.navigate({ routeName: routeList.Landing })),
  handleRestoreAccess: (mnemonic: string[]) =>
    dispatch(recoveryActions.onRestoreAccess(mnemonic)),
})

export const InputSeedPhrase = connect(
  mapStateToProps,
  mapDispatchToProps,
)(InputSeedPhraseContainer)
