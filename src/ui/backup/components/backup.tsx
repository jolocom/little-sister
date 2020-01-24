import * as React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Wrapper } from '../../structure'
import { Colors } from '../../../styles'
import { fontMain } from '../../../styles/typography'
import { JolocomButton } from '../../structure'
import { NavigationSection } from '../../structure/navigationSection'

interface Props {
  isLoading: boolean
  isAutoBackupEnabled: boolean
  enableAutoBackup: () => void
  onDisableAutoBackup: () => void
  exportBackup: () => void
  goBack: () => void
  lastBackup?: string
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.baseBlack,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollView: {
    padding: 18,
    paddingBottom: '10%',
  },
  section: {
    backgroundColor: Colors.black,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 32,
    borderRadius: 8,
    padding: 24,
    paddingBottom: 28,
  },
  title: {
    fontFamily: fontMain,
    color: Colors.white,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: fontMain,
    color: Colors.white,
    fontSize: 22,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontMain,
    color: Colors.white050,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  warning: {
    fontFamily: fontMain,
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 28,
  },
  info: {
    fontFamily: fontMain,
    fontSize: 14,
    textAlign: 'center',
    color: Colors.purpleMain,
    marginTop: 28,
  },
  buttonContainer: {
    height: 45,
    marginTop: 22,
    width: '100%',
    paddingVertical: 9,
    margin: 0,
    borderRadius: 8,
  },
})

export const BackupComponent: React.FC<Props> = ({
  isLoading,
  enableAutoBackup,
  onDisableAutoBackup,
  exportBackup,
  isAutoBackupEnabled,
  goBack,
  lastBackup,
}) => {
  return (
    <Wrapper style={styles.container}>
      <NavigationSection
        onNavigation={goBack}
        isBackButton={true}
        isDark={true}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Backup options</Text>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Backup data on your own</Text>
          <Text style={styles.description}>
            Download an encrypted copy of the data in your SmartWallet to your
            device. Make sure to keep your backups up-to-date and stored
            somewhere safe
          </Text>
          {/* VS: I think this option should be disabled if auto backup is enabled*/}
          <JolocomButton
            containerStyle={styles.buttonContainer}
            onPress={exportBackup}
            text={'Export file'}
            disabled={isLoading}
          />
          {!isAutoBackupEnabled && !!lastBackup && (
            <Text style={styles.info}>
              {`Last backup ${new Date(lastBackup).toLocaleDateString()}`}
            </Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Jolocom backup service</Text>
          <Text style={styles.description}>
            Store your information using Jolocom’s backup service. With this
            option, the Jolocom team cannot view your data and your info stays
            automatically up-to-date.
          </Text>
          {isAutoBackupEnabled ? (
            <React.Fragment>
              <JolocomButton
                containerStyle={styles.buttonContainer}
                text={isLoading ? 'Deleting backup...' : 'Disable auto-backup'}
                onPress={onDisableAutoBackup}
                disabled={isLoading}
              />
              {!!lastBackup && (
                <Text style={styles.info}>
                  {`Last backup ${new Date(lastBackup).toLocaleDateString()}`}
                </Text>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <JolocomButton
                containerStyle={styles.buttonContainer}
                onPress={enableAutoBackup}
                text={
                  isLoading ? 'Synchronization started…' : 'Use backup service'
                }
                disabled={isLoading}
              />
              <Text style={styles.warning}>
                By clicking here i agreed backing up my data on Jolocom’s
                central server and i know that it is not viewable by anyone
              </Text>
            </React.Fragment>
          )}
        </View>
      </ScrollView>
    </Wrapper>
  )
}
