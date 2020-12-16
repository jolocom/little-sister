import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { isFinalStyle } from '../../styles/config'

const DropdownIcon = props => (
  <Svg width={13} height={8} {...props}>
    <Path
      d="M12.076 1.543a.439.439 0 0 0 .123-.31.439.439 0 0 0-.123-.312.408.408 0 0 0-.595 0L6.25 6.386 1.02.92a.408.408 0 0 0-.596 0 .454.454 0 0 0 0 .622l5.529 5.786c.164.171.43.171.594 0l5.529-5.786z"
      fill={isFinalStyle ? '#FFFFFF' : '#000000'}
      fillRule="nonzero"
    />
  </Svg>
)

export default DropdownIcon
