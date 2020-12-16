import React from 'react'
import Svg, { Path } from 'react-native-svg'

function BackArrowIcon() {
  return (
    <Svg width={25} height={17} viewBox="0 0 25 17">
      <Path
        d="M24.48 7.438H3.34l5.362-5.469a.536.536 0 00.152-.375V.53A.53.53 0 008.334 0a.516.516 0 00-.369.156L.153 8.124a.539.539 0 000 .752l7.812 7.968c.15.152.372.198.568.116a.53.53 0 00.321-.491v-1.063a.536.536 0 00-.152-.375L3.34 9.562h21.138c.288 0 .521-.237.521-.53V7.968a.526.526 0 00-.52-.531z"
        fill="#F2F2F2"
        fillRule="nonzero"
      />
    </Svg>
  )
}

export default BackArrowIcon
