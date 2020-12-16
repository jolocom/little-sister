import { Colors, Typefaces } from '../../../styles'
import { Animated, Image, StyleSheet, Text, View } from 'react-native'
import I18n from '../../../locales/i18n'
import strings from '../../../locales/strings'
import { centeredText, fontMain, fontMedium } from '../../../styles/typography'
import React, { useRef } from 'react'
import { black065, greyLight, overflowBlack } from '../../../styles/colors'
import { DocumentReceiveCard } from './documentReceiveCard'
import {
  SignedCredentialWithMetadata,
  CredentialOfferFlowState,
} from '@jolocom/sdk/js/interactionManager/types'
import LinearGradient from 'react-native-linear-gradient'
import { IssuerPublicProfileSummary } from '@jolocom/sdk'

const styles = StyleSheet.create({
  logo: {
    borderRadius: 35,
    width: 70,
    height: 70,
    margin: 10,
    backgroundColor: greyLight,
  },
  headerWrapper: {
    width: '100%',
    height: 64,
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    // TODO @clauxx add shadows for ios
    elevation: 20,
    // HACK: @elevation won't work without @borderBottomWidth
    // https://github.com/timomeh/react-native-material-bottom-navigation/issues/8
    borderBottomWidth: 0,
  },
  headerServiceName: {
    ...Typefaces.subtitle1,
    fontFamily: fontMedium,
    color: Colors.overflowBlack,
  },
  profileWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  serviceName: {
    fontFamily: fontMedium,
    fontSize: 28,
    color: overflowBlack,
    marginTop: 12,
    ...centeredText,
  },
  description: {
    fontFamily: fontMain,
    fontSize: 16,
    color: black065,
    marginBottom: 40,
    marginHorizontal: '10%',
    ...centeredText,
  },
  scrollWrapper: {
    paddingBottom: '50%',
  },
  gradientWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

interface Props {
  publicProfile: IssuerPublicProfileSummary
  credentialOfferSummary: CredentialOfferFlowState
  invalidTypes: string[]
  onToggleSelect: (offering: SignedCredentialWithMetadata) => void
  isDocumentSelected: (offering: SignedCredentialWithMetadata) => boolean
}

export const CredentialReceiveComponent = (props: Props) => {
  const {
    publicProfile,
    credentialOfferSummary: { offerSummary, selectedTypes },
    onToggleSelect,
    isDocumentSelected,
    invalidTypes,
  } = props

  const issuerImage = publicProfile?.image && publicProfile.image
  const issuerName = publicProfile
    ? publicProfile.name
    : I18n.t(strings.UNKNOWN)

  const gradientColors = ['rgb(245, 245, 245)', 'rgba(245, 245, 245, 0.72)']

  // TODO abstract into CollapsibleScrollView if used elsewhere as well
  const transY = useRef(new Animated.Value(0)).current
  const handleScroll = Animated.event(
    [
      {
        nativeEvent: { contentOffset: { y: transY } },
      },
    ],
    { useNativeDriver: true },
  )

  const interpolateY = (inputRange: number[], outputRange: number[]) =>
    transY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    })

  // TODO @clauxx test and adjust values for small screens
  const headerOpacityValue = interpolateY([0, 100], [0, 1])
  const headerTextValueY = interpolateY([120, 150], [30, 0])
  const headerTextOpacityValue = interpolateY([130, 150], [0, 1])
  const detailsOpacityValue = interpolateY([0, 100], [1, 0])
  const profileScaleValue = interpolateY([0, 100], [1, 0.8])

  const isTypeValid = (type: string) => !invalidTypes.includes(type)
  const availableCredentials = offerSummary.filter(o =>
    selectedTypes.length ? selectedTypes.includes(o.type) : true,
  )

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Animated.View
        style={[styles.headerWrapper, { opacity: headerOpacityValue }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.5, y: 0.7 }}
          style={styles.gradientWrapper}>
          <Animated.Text
            style={[
              styles.headerServiceName,
              {
                transform: [
                  {
                    translateY: headerTextValueY,
                  },
                ],
                opacity: headerTextOpacityValue,
              },
            ]}>
            {issuerName}
          </Animated.Text>
        </LinearGradient>
      </Animated.View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollWrapper}
        scrollEventThrottle={1}
        onScroll={handleScroll}>
        <Animated.View
          style={[
            styles.profileWrapper,
            {
              transform: [
                { scaleY: profileScaleValue },
                { scaleX: profileScaleValue },
                { translateY: transY },
              ],
              opacity: detailsOpacityValue,
            },
          ]}>
          {issuerImage ? (
            <Image style={styles.logo} source={{ uri: issuerImage }} />
          ) : (
            <View style={styles.logo} />
          )}
          <Text style={styles.serviceName}>{issuerName}</Text>
        </Animated.View>
        <Animated.View
          style={[
            {
              transform: [
                {
                  translateY: transY,
                },
              ],
              opacity: detailsOpacityValue,
            },
          ]}>
          <Text style={styles.description}>
            {I18n.t(
              strings.CHOOSE_ONE_OR_MORE_DOCUMENTS_PROVIDED_BY_THIS_SERVICE_AND_WE_WILL_GENERATE_THEM_FOR_YOU,
            )}
          </Text>
        </Animated.View>
        {availableCredentials.map((offer, i) => {
          return (
            <DocumentReceiveCard
              key={i + offer.type}
              onToggle={() => isTypeValid(offer.type) && onToggleSelect(offer)}
              selected={isDocumentSelected(offer)}
              offering={offer}
              invalid={!isTypeValid(offer.type)}
            />
          )
        })}
      </Animated.ScrollView>
    </View>
  )
}
