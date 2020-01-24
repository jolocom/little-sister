import React from 'react'
import { connect } from 'react-redux'
import { ThunkDispatch } from '../../../store'
import { manualBackup, setAutoBackup } from '../../../actions/recovery'
import { NavigationScreenProps } from 'react-navigation'
import { BackupOfferComponent } from '../components/backupOffer'
import { navigationActions } from '../../../actions'
import { routeList } from '../../../routeList'
import { withLoading } from '../../../actions/modifiers'

interface Props
  extends ReturnType<typeof mapDispatchToProps>,
    NavigationScreenProps {}

const BackupOfferContainer: React.FC<Props> = props => {
  const { manualBackup, enableAutoBackup } = props
  return (
    <BackupOfferComponent
      enableAutoBackup={enableAutoBackup}
      manualBackup={manualBackup}
    />
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => {
  return {
    enableAutoBackup: async () => {
      await dispatch(withLoading(setAutoBackup(true)))
      dispatch(navigationActions.navigate({ routeName: routeList.Settings }))
    },
    manualBackup: async () => {
      await dispatch(manualBackup())
      dispatch(navigationActions.navigate({ routeName: routeList.Settings }))
    },
  }
}

export const BackupOffer = connect(
  null,
  mapDispatchToProps,
)(BackupOfferContainer)
