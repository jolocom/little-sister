import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

interface Props {
  scaledHeight: number
  color: string
}

export const BottomBarSVG = (props: Props) => (
  <Svg width="100%" height={props.scaledHeight} viewBox="0 0 414 110">
    <G fill="none">
      <Path
        fill={props.color}
        d="M414,37.536 L414,107.891537 L414,107.891537 L0,109 L0,37.536 C-2.53876144e-15,16.8054396 16.8054396,-1.04027126e-14 37.536,0 L163.51955,0 L163.51955,0 C161.798583,4.88903633 160.86221,10.1498511 160.86221,15.6302447 C160.86221,41.5272807 181.771313,62.5209787 207.564142,62.5209787 C233.35697,62.5209787 254.266074,41.5272807 254.266074,15.6302447 C254.266074,10.1498511 253.3297,4.88903633 251.608734,0 L376.464,0 C397.19456,-3.80814216e-15 414,16.8054396 414,37.536 Z"
      />
    </G>
  </Svg>
)
