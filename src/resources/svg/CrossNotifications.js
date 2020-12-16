import React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgCrossNotifications = props => (
  <Svg width={16} height={17} {...props}>
    <Path
      d="M7.235 8.412L.153 15.476a.501.501 0 0 0 .356.857.501.501 0 0 0 .356-.147L8 9.07l7.136 7.117a.502.502 0 0 0 .712-.71L8.766 8.412l7.086-7.069a.501.501 0 0 0 0-.71.505.505 0 0 0-.712 0L8 7.755.86.633a.505.505 0 0 0-.712 0 .501.501 0 0 0 0 .71l7.087 7.069z"
      fill="#FFF"
      fillRule="nonzero"
    />
  </Svg>
)

export default SvgCrossNotifications
