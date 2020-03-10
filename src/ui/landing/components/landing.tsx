import React from 'react'
import { StyleSheet, Dimensions, View, Text, Animated } from 'react-native'
import { Wrapper, OnlineJolocomButton } from 'src/ui/structure'
import I18n from 'src/locales/i18n'
import strings from 'src/locales/strings'
import { landingSlides, Slide } from './landingSlides'
import Carousel, {
  CarouselProps,
  getInputRangeFromIndexes,
} from 'react-native-snap-carousel'
import { Typography, Colors, Spacing, Buttons } from 'src/styles'

interface Props {
  handleGetStarted: () => void
  handleRecover: () => void
}

const viewWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: Colors.blackMain,
  },
  carouselSlide: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  carouselTextContainer: {
    marginTop: viewWidth > 360 ? Spacing['4XL'] : Spacing.XXL,
    position: 'absolute',
    paddingHorizontal: '5%',
  },
  header: {
    ...Typography.mainText,
    textAlign: 'center',
    color: Colors.sandLight,
  },
  message: {
    ...Typography.subMainText,
    textAlign: 'center',
    color: Colors.sandLight080,
    lineHeight: Typography.subMainText.fontSize + 4,
    marginTop: Spacing.SM,
  },
  activeDotStyle: {
    width: 8,
    height: 8,
    backgroundColor: Colors.dotColorActive,
  },
  inactiveDotStyle: {
    width: 8,
    height: 8,
    backgroundColor: Colors.dotColorInactive,
  },
  bottomSection: {
    position: 'absolute',
    width: '85%',
    bottom: '5%',
    alignItems: 'center',
  },
  mainButtonContainer: {
    ...Buttons.buttonStandardContainer,
    alignSelf: 'stretch',
  },
  mainButtonText: {
    ...Buttons.buttonStandardText,
  },
  recoverButtonContainer: {
    ...Buttons.buttonStandardContainer,
    backgroundColor: 'transparent',
    marginTop: Spacing.XS,
    alignSelf: 'stretch',
  },
  recoverButtonText: {
    ...Buttons.buttonStandardText,
    fontSize: Typography.textSM,
  },
})

export class LandingComponent extends React.Component<Props> {
  // https://github.com/archriss/react-native-snap-carousel/blob/master/doc/CUSTOM_INTERPOLATIONS.md
  // 0 is the current slide, and we want there to be an animated fade in/out
  private scrollInterpolator(index: number, carouselProps: CarouselProps<any>) {
    const range = [1, 0, -1]
    const inputRange = getInputRangeFromIndexes(range, index, carouselProps)
    return { inputRange, outputRange: range }
  }

  private animatedStyles(
    index: number,
    animatedValue: Animated.AnimatedValue,
    carouselProps: CarouselProps<any>,
  ) {
    return {
      opacity: animatedValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-1.5, 1, -1.5],
      }),
    }
  }

  private renderItem = ({ item }: { item: Slide }) => {
    const { bgImage, title, infoText } = item
    return (
      <View style={styles.carouselSlide}>
        {bgImage}
        <View style={styles.carouselTextContainer}>
          <Text style={styles.header}>{title}</Text>
          <Text style={styles.message}>{infoText}</Text>
        </View>
      </View>
    )
  }

  public render() {
    return (
      <Wrapper style={styles.mainContainer}>
        <Carousel
          testID="landingCarousel"
          data={landingSlides}
          renderItem={this.renderItem}
          lockScrollWhileSnapping
          lockScrollTimeoutDuration={1000}
          loop
          autoplay
          autoplayDelay={5000}
          autoplayInterval={5000}
          sliderWidth={viewWidth}
          itemWidth={viewWidth}
          layout={'default'}
          scrollInterpolator={this.scrollInterpolator}
          /** @TODO Fix typing? */
          // @ts-ignore
          slideInterpolatedStyle={this.animatedStyles}
        />
        <View style={styles.bottomSection}>
          <OnlineJolocomButton
            testID="getStarted"
            containerStyle={{ width: '100%' }}
            onPress={this.props.handleGetStarted}
            text={I18n.t(strings.GET_STARTED)}
          />
          <OnlineJolocomButton
            testID="recoverIdentity"
            containerStyle={{
              width: '100%',
              marginTop: 12,
              height: 48,
            }}
            onPress={this.props.handleRecover}
            text={I18n.t(strings.RECOVER_IDENTITY)}
            transparent={true}
          />
        </View>
      </Wrapper>
    )
  }
}
