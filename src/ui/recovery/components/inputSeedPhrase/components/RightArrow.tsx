import React from 'react'
import ForthArrowIcon from 'src/resources/svg/ForthArrowIcon'

import Arrow, { ArrowDirections } from './Arrow'

interface PropsI {
  handlePress: () => void
}

const RightArrow: React.FC<PropsI> = ({ handlePress }) => {
  return (
    <Arrow direction={ArrowDirections.right} onPress={handlePress}>
      <ForthArrowIcon />
    </Arrow>
  )
}

export default RightArrow
