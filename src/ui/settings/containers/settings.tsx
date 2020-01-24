import React from 'react'
import VersionNumber from 'react-native-version-number'
import { StyleSheet, Text, View, ScrollView } from 'react-native'
import I18n, { locales } from 'src/locales/i18n'
import strings from '../../../locales/strings'
import { Colors, Spacing, Typography } from 'src/styles'
import { Wrapper } from 'src/ui/structure'
import { SettingSection } from '../components/settingSection'
import { RootState } from '../../../reducers'
import { ThunkDispatch } from '../../../store'
import { routeList } from 'src/routeList'
import { withErrorScreen, withLoading } from '../../../actions/modifiers'
import { genericActions, navigationActions } from '../../../actions'
import { connect } from 'react-redux'
import { LocaleSetting } from '../components/localeSetting'
import SettingItem from '../components/settingItem'
import settingKeys from '../settingKeys'
import { showSeedPhrase } from '../../../actions/recovery'
import { NavigationParams } from 'react-navigation'

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundLightMain,
  },
  scrollComponent: {
    width: '100%',
  },
  scrollComponentContainer: {
    paddingBottom: 110,
  },
  versionNumber: {
    ...Typography.baseFontStyles,
    fontSize: Typography.textXS,
    textAlign: 'center',
    color: Colors.blackMain040,
    marginTop: Spacing.XL,
  },
})

interface Props
  extends ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps> {}

export const SettingsContainer: React.FC<Props> = props => {
  const { navigate, setLocale, settings, setupBackup } = props
  const version = VersionNumber.appVersion
  const currentLocale = settings.locale
  const seedPhraseSaved = settings[settingKeys.seedPhraseSaved] as boolean
  return (
    <Wrapper style={styles.container}>
      <ScrollView
        style={styles.scrollComponent}
        contentContainerStyle={styles.scrollComponentContainer}
      >
        {__DEV__ && (
          <SettingSection title={'Dev'}>
            <SettingItem
              iconName={'book-open-page-variant'}
              title={'Storybook'}
              onPress={() => navigate(routeList.Storybook)}
            />
            <SettingItem
              title={'Notification Scheduler'}
              description={'Mock notifications for debugging'}
              onPress={() => navigate(routeList.NotificationScheduler)}
              iconName={'bell-ring'}
            />
            <SettingItem
              title={'Error report Test'}
              description={'Exception Screen'}
              iconName={'alert'}
              onPress={() =>
                navigate(routeList.Exception, {
                  error: new Error('Test Error'),
                })
              }
            />
          </SettingSection>
        )}
        <SettingSection title={I18n.t(strings.YOUR_PREFERENCES)}>
          <LocaleSetting
            locales={locales}
            currentLocale={currentLocale}
            setLocale={setLocale}
          />
        </SettingSection>
        <SettingSection title={I18n.t(strings.SECURITY)}>
          <SettingItem
            title={I18n.t(strings.BACKUP_YOUR_IDENTITY)}
            iconName={'flash'}
            description={
              seedPhraseSaved
                ? I18n.t(strings.YOUR_IDENTITY_IS_ALREADY_BACKED_UP)
                : I18n.t(
                    strings.SET_UP_A_SECURE_PHRASE_TO_RECOVER_YOUR_ACCOUNT_IN_THE_FUTURE_IF_YOUR_PHONE_IS_STOLEN_OR_IS_DAMAGED,
                  )
            }
            isHighlighted={!seedPhraseSaved}
            isDisabled={seedPhraseSaved}
            onPress={setupBackup}
          />
          <SettingItem
            title={'Backup'}
            description={'Securely backup your data'}
            iconName={'delete'}
            onPress={() => navigate(routeList.Backup)}
            isDisabled={!seedPhraseSaved}
          />
        </SettingSection>
        <Text style={styles.versionNumber}>
          Jolocom SmartWallet {I18n.t(strings.VERSION)} {version}
        </Text>
        <View />
      </ScrollView>
    </Wrapper>
  )
}

const mapStateToProps = (state: RootState) => ({
  settings: state.settings,
})

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  setLocale: (locale: string) =>
    dispatch(withLoading(genericActions.setLocale(locale))),
  navigate: (routeName: routeList, params?: NavigationParams) =>
    dispatch(
      navigationActions.navigate({
        routeName,
        params,
      }),
    ),
  setupBackup: () => dispatch(withErrorScreen(showSeedPhrase())),
})

export const Settings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsContainer)
