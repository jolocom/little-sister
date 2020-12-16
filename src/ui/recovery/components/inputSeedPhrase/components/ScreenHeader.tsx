import React from 'react'
import { View } from 'react-native'
import { Colors } from 'src/ui/deviceauth/colors'
import { JoloTextSizes } from '../utils/fonts'
import JoloText, { JoloTextKind, JoloTextWeight } from './JoloText'

interface PropsI {
  title: string
  subtitle: string
}

const ScreenHeader: React.FC<PropsI> = ({ title, subtitle }) => {
  return (
    <View>
      <JoloText
        kind={JoloTextKind.title}
        size={JoloTextSizes.middle}
        weight={JoloTextWeight.regular}
        color={Colors.white85}>
        {title}
      </JoloText>
      <JoloText
        kind={JoloTextKind.subtitle}
        size={JoloTextSizes.middle}
        color={Colors.white70}
        customStyles={{ opacity: 0.8, paddingVertical: 18 }}>
        {subtitle}
      </JoloText>
    </View>
  )
}

export default ScreenHeader
