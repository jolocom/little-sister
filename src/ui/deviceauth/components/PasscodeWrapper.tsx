import React from 'react'
import { View, ViewStyle } from 'react-native'
import { BP } from '../../../styles/breakpoints'

interface Props {
  customStyles?: ViewStyle
}

const PasscodeWrapper: React.FC<Props> = ({ children, customStyles = {} }) => {
  return (
    <View
      style={{
        flex: 1,
        paddingTop: BP({
          small: '20%',
          medium: '35%',
          large: '35%',
        }),
        justifyContent: 'flex-start',
        alignItems: 'center',
        ...customStyles,
      }}>
      {children}
    </View>
  )
}

export default PasscodeWrapper
