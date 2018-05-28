import React from 'react'
import { StyleSheet, Dimensions } from 'react-native'
import { Button } from 'react-native-material-ui'
import { Block, Container, CenteredText } from 'src/ui/structure'
import { JolocomTheme } from 'src/styles/jolocom-theme'
import { ReactNode } from 'react'
import { Landing00 } from 'src/resources'

const Carousel = require('react-native-snap-carousel').default
const Pagination = require('react-native-snap-carousel').Pagination

interface State {
  activeSlide: number;
}

interface Props {
  handleButtonTap: () => void;
}

interface Slide {
  svgImage: ReactNode;
  title: string;
  infoText: string;
}

const viewWidth: number = Dimensions.get('window').width

const styles = StyleSheet.create({
  mainContainerStyle: {
    backgroundColor: JolocomTheme.primaryColorBlack,
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    flex: 1
  },
  svgContainer: {
    flex: 4/5,
    marginTop: "10%",
    marginLeft: '45%',
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  carouselTextContainer: {
    padding: '10%',
    flex: 3/5,
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  activeDotStyle: {
    width: 8,
    height: 8,
    backgroundColor: JolocomTheme.dotColorActive
  },
  inactiveDotStyle: {
    width: 4,
    height: 4,
    opacity: 0.6,
    backgroundColor: JolocomTheme.dotColorInactive
  },
  header: {
    color: JolocomTheme.primaryColorSand,
    fontFamily: JolocomTheme.contentFontFamily, 
    fontSize: JolocomTheme.landingHeaderFontSize,
    fontWeight: '100'
  },
  headerBlock: {
    paddingBottom: '5%'
  }, 
  subHeaderBlock: {
    paddingTop: '7%'
  },
  subHeader: {
    fontWeight: '100',
    color: JolocomTheme.primaryColorSand,
    fontFamily: JolocomTheme.contentFontFamily, 
    opacity: 0.8,
    fontSize: JolocomTheme.labelFontSize,
    lineHeight: JolocomTheme.labelFontSize + 4
  },
  paginationBlock: {
    flex: 0.2,
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  buttonBlock: {
    flex: 0.1,
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  buttonContainer: {
    height: '100%',
    width: '50%',
    borderRadius: 4,
    backgroundColor: JolocomTheme.primaryColorPurple
  },
  buttonText: {
    fontFamily: JolocomTheme.contentFontFamily,
    color: JolocomTheme.primaryColorWhite,
    fontWeight: '100',
    fontSize: JolocomTheme.landingHeaderFontSize
  },
  paginationBlockStyle: {
    flex: 1/5,
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  buttonBlockStyle: {
    flex: 1/10,
    backgroundColor: JolocomTheme.primaryColorBlack
  },
  buttonStyle: {
    color: JolocomTheme.primaryColorPurple,
    fontSize: JolocomTheme.headerFontSize
  }
})

const carouselInfo: Slide[] = [
  {
    svgImage: <Landing00 height={'100%'} width={'100%'} />,
    title: 'Meet Jolocom Wallet',
    infoText: 'It will help you to take back ownership of your digital self and control the usage of your private data when signing into services.'
  },
  {
    svgImage: <Landing00 height={'100%'} width={'100%'} />,
    title: 'Feature 1',
    infoText: 'Your (personal) ... one sentence pitch to wrap the main value'
  },
  {
    svgImage: <Landing00 height={'100%'} width={'100%'} />,
    title: 'Feature 2',
    infoText: 'Your (personal) ... one sentence pitch to wrap the main value'
  },
  {
    svgImage: <Landing00 height={'100%'} width={'100%'} />,
    title: 'Feature 3',
    infoText: 'Your (personal) ... one sentence pitch to wrap the main value'
  }
]

export class LandingComponent extends React.Component<Props, State> {
  state = {
    activeSlide: 0
  }

  private renderItem = ({ item } : { item : Slide }) => {
    const { svgImage, title, infoText  } = item
    return (
      <Block>
        <Block style={ styles.svgContainer }>
        {svgImage}
        </Block>
        <Block style={ styles.carouselTextContainer }>
            <Block>   
              <CenteredText style= { styles.header } msg={ title } />
            </Block>
            <Block>
              <CenteredText style={ styles.subHeader } msg={ infoText } />
            </Block>
        </Block>
      </Block>
    )
  }

  private renderPagination () {
    const { activeSlide } = this.state
    return (
      <Pagination
        dotsLength={ carouselInfo.length }
        activeDotIndex={ activeSlide }
        dotStyle={ styles.activeDotStyle }
        inactiveDotStyle={ styles.inactiveDotStyle }
        inactiveDotOpacity={ 0.4 }
        inactiveDotScale={ 0.6 }
      />
    )
  }
 
  render() {
    return (
      <Container style= { styles.mainContainerStyle }>
        <Block>
          <Carousel
            data={ carouselInfo }
            renderItem={ this.renderItem }
            lockScrollWhileSnapping
            lockScrollTimeoutDuration={1000}
            loop
            sliderWidth={ viewWidth }
            itemWidth={ viewWidth }
            layout={ 'default' }
            onSnapToItem={(index : number) =>
              this.setState({ activeSlide: index })
            }
          />
        </Block>
        <Block style={ styles.paginationBlock}>
          { this.renderPagination() }
        </Block>
        <Block style={ styles.buttonBlock}>
          <Button
            raised
            onPress={ this.props.handleButtonTap }
            style={{ 
              container: styles.buttonContainer, 
              text: styles.buttonText 
            }}
            upperCase= { false }
            text='Get started'
          />
        </Block>
      </Container>
    )
  }
}
