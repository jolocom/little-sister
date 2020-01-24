import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { isFinalStyle } from '../../styles/config'

const SvgCrossIcon = props => (
  <Svg width={18} height={18} {...props}>
    <Path
      d="M.253 1.502a.896.896 0 0 1 0-1.249.897.897 0 0 1 1.249 0l7.494 7.504L16.502.253a.881.881 0 0 1 1.236 0c.35.35.35.912 0 1.249l-7.494 7.492 7.494 7.504c.35.338.35.9 0 1.249a.881.881 0 0 1-1.236 0l-7.506-7.504-7.494 7.504a.897.897 0 0 1-1.249 0 .896.896 0 0 1 0-1.249l7.494-7.504L.253 1.502z"
      fill={props.dark || isFinalStyle ? 'rgb(242, 242, 242)' : '#2C2C2C'}
      fillRule="nonzero"
    />
  </Svg>
)

export default SvgCrossIcon
