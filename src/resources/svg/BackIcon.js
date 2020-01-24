import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { isFinalStyle } from '../../styles/config'

const SvgBackIcon = props => (
  <Svg width={25} height={17} {...props}>
    <Path
      d="M24.48 7.438H3.34l5.362-5.469a.536.536 0 0 0 .152-.375V.53A.53.53 0 0 0 8.334 0a.516.516 0 0 0-.369.156L.153 8.124a.539.539 0 0 0 0 .752l7.812 7.968c.15.152.372.198.568.116a.53.53 0 0 0 .321-.491v-1.063a.536.536 0 0 0-.152-.375L3.34 9.562h21.138c.288 0 .521-.237.521-.53V7.968a.526.526 0 0 0-.52-.531z"
      fill={props.dark || isFinalStyle ? 'rgb(242, 242, 242)' : '#2C2C2C'}
      fillRule="nonzero"
    />
  </Svg>
)

export default SvgBackIcon
