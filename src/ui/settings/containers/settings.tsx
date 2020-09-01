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
import SettingItem from '../components/settingItem'
import settingKeys from '../settingKeys'
import { showSeedPhrase } from '../../../actions/recovery'
import { LocaleSetting } from '../components/localeSetting'

const styles = StyleSheet.create({
  scrollComponent: {
    width: '100%',
  },
  scrollComponentContainer: {
    paddingBottom: '40%',
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
  const { settings, setupBackup, navigate, setLocale } = props
  const version = VersionNumber.appVersion
  const currentLocale = settings.locale

  const seedPhraseSaved = settings[settingKeys.seedPhraseSaved] as boolean
  return (
    <Wrapper centered>
      <ScrollView
        style={styles.scrollComponent}
        contentContainerStyle={styles.scrollComponentContainer}>
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
              title="Change PIN"
              onPress={() => navigate(routeList.ChangePIN)}
              iconName="bell-ring"
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
          {/*
          <SettingsItem
            title={I18n.t(strings.DELETE_IDENTITY)}
            description={'(coming soon)'}
            iconName={'delete'}
            isDisabled
          />
          */}
        </SettingSection>
        <SettingSection title={I18n.t(strings.ABOUT)}>
          <SettingItem
            title={I18n.t(strings.PRIVACY_POLICY)}
            iconName={'shield-lock'}
            onPress={() => navigate(routeList.PrivacyPolicy)}
          />
          <SettingItem
            title={I18n.t(strings.TERMS_OF_SERVICE)}
            iconName={'file-document'}
            onPress={() => navigate(routeList.TermsOfService)}
          />
          <SettingItem
            title={I18n.t(strings.IMPRINT)}
            iconName={'book-minus'}
            onPress={() => navigate(routeList.Impressum)}
          />
          <SettingItem
            title={'Contact us'}
            iconName={'contacts'}
            onPress={() =>
              navigate(routeList.ErrorReporting, {
                error: new Error('Contact us'),
                previousScreen: routeList.Settings,
              })
            }
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
  navigate: (route: routeList, params?: any) =>
    dispatch(
      navigationActions.navigate({
        routeName: route,
        params,
      }),
    ),
  setupBackup: () => dispatch(withErrorScreen(showSeedPhrase())),
})

export const Settings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsContainer)
