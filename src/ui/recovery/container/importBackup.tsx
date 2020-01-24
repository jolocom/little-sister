import React from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import { withErrorScreen, withLoading } from '../../../actions/modifiers'
import { recoverIdentity } from '../../../actions/registration'
import {
  EncryptedData,
  EncryptedKey,
} from 'jolocom-lib/js/vaultedKeyProvider/softwareProvider'
import DocumentPicker from 'react-native-document-picker'
import { readFile } from 'react-native-fs'
import { NavigationScreenProps } from 'react-navigation'
import ImportBackupComponent from '../components/importBackup'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationScreenProps {}

interface State {
  error: string
}

export class ImportBackupContainer extends React.Component<Props, State> {
  public state = {
    error: '',
  }
  private getBackupFile = async () => {
    // open dialog/ file manager to select backup file
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.plainText],
    })
    // read selected file
    const importedData = await readFile(res.uri)

    const encryptedBackup = this.validateImport(importedData)
    if (encryptedBackup) {
      // we can not set the last backup date, because this is not part of the backup
      this.props.recoverIdentity(encryptedBackup)
    }
  }

  private validateImport = (
    importedData: string,
  ): EncryptedData | undefined => {
    try {
      if (
        !this.props.navigation.state.params ||
        !this.props.navigation.state.params.pubKey
      ) {
        console.error('Missing "pubKey" parameter in navigation props!')
        return // this is mainly here to keep typescript happy
      }
      const pubKey = this.props.navigation.state.params.pubKey
      const encryptedBackup = JSON.parse(importedData)
      const publicKeys = encryptedBackup['keys'].map(
        (e: EncryptedKey) => e.pubKey,
      )
      // check if a publicKey is matching the current identity
      if (publicKeys.find((key: string) => key === pubKey)) {
        return encryptedBackup
      }
      this.setError('Wrong backup file, not related to the recovered identity')
      return
    } catch (e) {
      // e.g. json parsing error if file was a random text file
      this.setError(e.message)
      return
    }
  }

  private setError = (error: string) => {
    this.setState({ error })
  }

  public render(): JSX.Element {
    const { error } = this.state

    return (
      <ImportBackupComponent
        importBackup={this.getBackupFile}
        skip={() => this.props.recoverIdentity()}
        error={error}
      />
    )
  }
}

const mapStateToProps = () => ({})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  recoverIdentity: (encryptedBackup?: EncryptedData) =>
    dispatch(withLoading(withErrorScreen(recoverIdentity(encryptedBackup)))),
})

export const ImportBackup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ImportBackupContainer)
