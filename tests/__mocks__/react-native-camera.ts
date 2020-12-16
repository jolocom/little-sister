import React from 'react'

const constants = {
  Aspect: {},
  BarCodeType: {},
  Type: {},
  CaptureMode: {},
  CaptureTarget: {},
  CaptureQuality: {},
  Orientation: {},
  FlashMode: {
    off: 'off',
    torch: 'torch',
    flash: 'flash',
  },
  TorchMode: {},
}

class Camera extends React.Component {
  static Constants = constants
  render() {
    return null
  }
}

export const RNCamera = Camera
export default Camera
