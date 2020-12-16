import React from 'react'
import { Svg, G, Path } from 'react-native-svg'

export default function MoreIcon() {
  return (
    <Svg height="16" width="16" viewBox="0 0 4 16">
      <G fill="none" fillRule="evenodd">
        <Path d="M-4-4H8v24H-4z" />
        <Path
          d="M2 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="#000"
          opacity=".3"
        />
      </G>
    </Svg>
  )
}
