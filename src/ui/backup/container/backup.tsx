import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import { BackupComponent } from '../components/backup'
import { RootState } from '../../../reducers'
import {
  disableAndRemoveBackup,
  manualBackup,
  setAutoBackup,
} from '../../../actions/recovery'
import { timeout } from '../../../utils/asyncTimeout'
import { NavigationScreenProps } from 'react-navigation'
import { Alert } from 'react-native'
import { navigationActions } from '../../../actions'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    ReturnType<typeof mapStateToProps>,
    NavigationScreenProps {}

const BackupContainer: React.FC<Props> = props => {
  const {
    isAutoBackupEnabled,
    lastBackup,
    navigateBack,
    disableAutoBackupAndDelete,
    exportBackup,
  } = props
  const [isLoading, setLoading] = useState(false)

  const toggleLoading = () => {
    setLoading(!isLoading)
  }

  const enableAutoBackup = async () => {
    toggleLoading()
    await timeout(500)
    try {
      await enableAutoBackup()
    } catch (e) {
      // TODO show notification
      console.warn(e)
    } finally {
      toggleLoading()
    }
  }

  const onDisableAutoBackup = async () => {
    Alert.alert(
      'Are you sure?',
      'By disabling this function you will erase all information from our server',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'default', onPress: disableAutoBackup },
      ],
    )
  }

  const disableAutoBackup = async () => {
    toggleLoading()
    await timeout(500)
    try {
      await disableAutoBackupAndDelete()
    } catch (e) {
      // TODO show notification
      console.warn(e)
    } finally {
      toggleLoading()
    }
  }

  const onExportBackup = async () => {
    toggleLoading()
    try {
      await exportBackup()
    } catch (e) {
      console.warn(e)
    } finally {
      toggleLoading()
    }
  }

  return (
    <BackupComponent
      isLoading={isLoading}
      onDisableAutoBackup={onDisableAutoBackup}
      isAutoBackupEnabled={isAutoBackupEnabled}
      exportBackup={onExportBackup}
      enableAutoBackup={enableAutoBackup}
      goBack={navigateBack}
      lastBackup={lastBackup}
    />
  )
}

const mapStateToProps = (state: RootState) => ({
  isAutoBackupEnabled: state.settings.autoBackup,
  lastBackup: state.settings.lastBackup,
})
const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  enableAutoBackup: async () => await dispatch(setAutoBackup(true)),
  disableAutoBackupAndDelete: () => dispatch(disableAndRemoveBackup()),
  exportBackup: () => dispatch(manualBackup()),
  navigateBack: () => dispatch(navigationActions.navigateBack()),
})

export const Backup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BackupContainer)
