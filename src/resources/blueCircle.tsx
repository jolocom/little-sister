import React from 'react'
import { Image } from 'react-native'

const BlueCircleImage: React.FC = props => {
  return (
    <Image
      resizeMode={'contain'}
      source={require('./img/blue_circle.png')}
      style={{ width: '100%', height: '100%' }}
      {...props}
    />
  )
}

export default BlueCircleImage
