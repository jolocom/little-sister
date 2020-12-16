import * as React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

function SvgComponent(props) {
  return (
    <Svg width="14px" height="11px" viewBox="0 0 14 11" {...props}>
      <G
        id="Toasts"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <G
          id="terms-/-S"
          transform="translate(-39.000000, -459.000000)"
          fill="#FFFFFF"
          fillRule="nonzero"
        >
          <G id="Group" transform="translate(32.000000, 450.000000)">
            <Path
              d="M20.6174332,10.0401805 C20.2971286,9.7199305 19.7777067,9.7199305 19.457402,10.0402352 L12.2135506,17.2840866 L8.40035533,13.4708914 C8.08005064,13.1505867 7.56062878,13.1505867 7.24026941,13.4708914 C6.91991004,13.7911961 6.91991004,14.3106179 7.24026941,14.6309773 L11.6334803,19.0241882 C11.79366,19.1843678 12.0036053,19.2644303 12.2134959,19.2644303 C12.4233865,19.2644303 12.6333865,19.1843132 12.7935115,19.0241882 L20.6174332,11.2002664 C20.9377926,10.8799617 20.9377926,10.3605399 20.6174332,10.0401805 Z"
              id="Path"
            />
          </G>
        </G>
      </G>
    </Svg>
  )
}

export default SvgComponent
