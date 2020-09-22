import React, { useState } from 'react'
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { ThunkDispatch } from 'src/store'
import { storeTermsOfService } from 'src/actions/generic'
import { JolocomButton, Wrapper } from '../structure'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { routeList } from 'src/routeList'
import { fontMain, fontMedium } from 'src/styles/typography'
import {
  termsOfServiceEN,
  termsOfServiceDE,
  privacyPolicyEN,
  privacyPolicyDE,
} from './legalTexts'
import { CheckmarkSmallIcon } from 'src/resources'
import strings from 'src/locales/strings'
import I18n from 'src/locales/i18n'
import { BP } from 'src/styles/breakpoints'
import { ActionSheet } from '../structure/actionSheet'

interface NavigationProps {
  onSubmit: () => void
}

interface Props extends ReturnType<typeof mapDispatchToProps> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>
}

enum TextType {
  None,
  PrivacyEN,
  PrivacyDE,
  TermsEN,
  TermsDE,
}

export const ConsentTextButton: React.FC<{
  text: string
  onPress: () => void
}> = ({ onPress, text }) => {
  return (
    <TouchableOpacity style={styles.consentButton} onPress={onPress}>
      <Text style={styles.termsText}>{text}</Text>
    </TouchableOpacity>
  )
}

export const ConsentText: React.FC<{ text: string; onPress: () => void }> = ({
  onPress,
  text,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.termsText}>{text}</Text>
    </TouchableOpacity>
  )
}

const TermsOfServiceConsentContainer: React.FC<Props> = ({
  storeTermsConsent,
  navigation,
}) => {
  const {
    state: {
      params: { onSubmit },
    },
  } = navigation
  const [accepted, setAccepted] = useState(false)
  const [textType, setTextType] = useState(TextType.None)

  const getLegalText = () => {
    switch (textType) {
      case TextType.TermsEN:
        return termsOfServiceEN
      case TextType.TermsDE:
        return termsOfServiceDE
      case TextType.PrivacyEN:
        return privacyPolicyEN
      case TextType.PrivacyDE:
        return privacyPolicyDE
      default:
        return ''
    }
  }

  return (
    <Wrapper secondaryDark>
      <View
        style={{ paddingHorizontal: BP({ small: 20, medium: 32, large: 32 }) }}>
        <Text style={styles.title}>
          {I18n.t(
            strings.SMARTWALLET_INTRODUCING_TERMS_AND_CONDITIONS_AND_PRIVACY_POLICY,
          )}
        </Text>
      </View>
      <View style={styles.termsWrapper}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: '80%' }}
          showsVerticalScrollIndicator={false}
          overScrollMode={'never'}>
          <Text style={styles.description}>
            {I18n.t(
              strings.YOU_CAN_FIND_THE_GERMAN_AND_ENGLISH_VERSION_OF_THE_DOCUMENTS_BELOW,
            )}
          </Text>
          {textType === TextType.None ? (
            <>
              <ConsentTextButton
                text={'Terms of Service'}
                onPress={() => setTextType(TextType.TermsEN)}
              />
              <ConsentTextButton
                text={'Privacy Policy'}
                onPress={() => setTextType(TextType.PrivacyEN)}
              />
              <ConsentTextButton
                text={'Nutzungsbedingungen'}
                onPress={() => setTextType(TextType.TermsDE)}
              />
              <ConsentTextButton
                text={'Datenschutzerklärung'}
                onPress={() => setTextType(TextType.PrivacyDE)}
              />
            </>
          ) : (
            <ConsentText
              text={getLegalText()}
              onPress={() => setTextType(TextType.None)}
            />
          )}
        </ScrollView>
      </View>
      <ActionSheet showSlide={true} customStyles={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => setAccepted(!accepted)}
          style={styles.acceptWrapper}>
          <View style={{ flex: 0.1 }}>
            <View
              style={[
                styles.checkboxBase,
                accepted ? styles.checkboxActive : styles.checkboxInactive,
              ]}>
              {accepted ? <CheckmarkSmallIcon /> : null}
            </View>
          </View>
          <View style={{ paddingLeft: 20, flex: 0.9 }}>
            <Text style={styles.acceptText}>
              {I18n.t(
                strings.I_UNDERSTAND_AND_ACCEPT_THE_TERMS_OF_SERVICE_AND_PRIVACY_POLICY,
              )}
            </Text>
          </View>
        </TouchableOpacity>
        <JolocomButton
          text={I18n.t(strings.ACCEPT_NEW_TERMS)}
          containerStyle={{ width: '100%' }}
          onPress={async () => {
            await storeTermsConsent()
            onSubmit()
          }}
          disabled={!accepted}
        />
      </ActionSheet>
    </Wrapper>
  )
}

const mapDispatchToProps = (dispatch: ThunkDispatch) => ({
  storeTermsConsent: () => dispatch(storeTermsOfService()),
})

const styles = StyleSheet.create({
  title: {
    fontFamily: fontMedium,
    fontSize: BP({ small: 24, medium: 28, large: 28 }),
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: BP({ small: 26, medium: 30, large: 30 }),
    letterSpacing: 0,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 30,
    marginBottom: BP({ small: 12, medium: 20, large: 20 }),
  },
  description: {
    fontFamily: fontMain,
    fontSize: BP({ small: 18, medium: 20, large: 20 }),
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: BP({ small: 20, medium: 22, large: 22 }),
    letterSpacing: 0.14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: BP({ small: 32, medium: 54, large: 54 }),
  },
  bottomBar: {
    paddingTop: 26,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  checkboxBase: {
    width: 28,
    height: 28,
    borderRadius: 20,
  },
  acceptWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkboxActive: {
    backgroundColor: 'rgb(82, 81, 193)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  acceptText: {
    fontFamily: fontMain,
    fontSize: BP({ small: 14, medium: 16, large: 16 }),
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: 'rgba(255,255,255,0.9)',
  },
  termsText: {
    fontFamily: fontMain,
    fontSize: BP({ small: 18, medium: 20, large: 20 }),
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0.14,
    color: '#7372ee',
  },
  termsWrapper: {
    flex: 3,
    width: '100%',
    paddingHorizontal: BP({ small: 20, medium: 32, large: 32 }),
  },
  consentButton: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: BP({ small: 6, medium: 10, large: 10 }),
  },
})

export const TermsOfServiceConsent = connect(
  null,
  mapDispatchToProps,
)(TermsOfServiceConsentContainer)
