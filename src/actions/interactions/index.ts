import { ThunkAction } from 'src/store';

export const connectToBleDevice = (device) => {
}

const ADD_BLE_DEVICE = 'BLA'

export const addBleDevice = (device) => ({
  type: ADD_BLE_DEVICE,
  value: { id: device.id, name: device.name }
})

export const initiateBLEScan: ThunkAction = async (
  dispatch,
  getState,
  backendMiddleware
) => {
  backendMiddleware.bleLib.startDeviceScan(device => dispatch(addBleDevice(device)))
}
