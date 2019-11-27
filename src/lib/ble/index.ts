import { Device, BleManager } from 'react-native-ble-plx';
import { JSONWebToken, JWTEncodable } from 'jolocom-lib/js/interactionTokens/JSONWebToken';

export type BleSerialConnectionConfig = {
  serviceUUID: string,
  rxUUID: string,
  txUUID: string,
}

export type DeviceDesc = {
  id: string,
  name: string
}

// a generator function to be passed in to the listen function as the callback
// This function will reduce together a token until delimiter and then call a callback function
// with the result
const waitForToken = (
  delimiter: string,
  callback: (jwt: string) => void
) => function*(received: string) {
  let delimIdx = -1
  do {
    received += yield
  } while (!received.includes(delimiter, -1))

  callback(received.slice(0, received.indexOf(delimiter)))
}

// a higher order function to send data in ~200b blocks
const writeAll = (
  size: number
) => (
  write: (toWrite: string) => Promise<void>
) => async (
  toWrite: string
) => write(toWrite.slice(0, size))
  .then(async _ => {
    if (toWrite.length > size) await writeAll(size)(write)(toWrite.slice(size))
  })

const serialUUIDs: BleSerialConnectionConfig = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  rxUUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  txUUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
}

// Discovery vs. Communication
// Discover over QR code, NFC, BLE
// Communicate over HTTPS or BLE

export class PeerConnection {
  private did!: string
  send() {
  }
}

export class Interaction {
  // post-discovery of a peer, one communicates with a peer in the context of an
  // interaction
  public tokens!: any[] = []
  private peerMap!: { [did: string]: PeerConnection }

  proceed(token) {
    this.proto.proceed(this, token)
  }

  get proto() {
    switch(this.tokens[0].type) {
      case 'bla':
        return { proceed: (interaction, token) => true }
      default:
        throw new Error('unknown interaction')
    }
  }

  static initiate(peer): Interaction {
    peer
  }
  constructor(initialToken, inChannel?, outChannel?) {
    this.tokens.push(initialToken)
    this.respond
    this.receive
    this.inChannel = inChannel
    this.outChannel = outChannel
  }


}

const presentProofVerifierProtocol = function*(
    send, verify
) {
    // send presentation request
    send(yield)    // get response
    const response = yield    if (response === 'presentation') {
        if (verify(response)) {
            // send ack
            send(yield)
        }
    }
}

const presentProofProoverProtocol = function*(
    send
) {
    // get request
    const request = yield    // user consent
    if (yield) {
        // send presentation
        send(yield)
        // recieve ack
        yield
    } else {
        // send rejection
        send(yield)
    }
}

export class BLE {
  private ble!: BleManager

  constructor() {
    this.ble = new BleManager()
  }

  async connectToPeer(device: Device) {
    const tokenCollector = waitForToken('\n')

    // TODO return interaction
    return new Promise(resolve => {
      this.ble
        .connectToDevice(device.id, { requestMTU: 512 })
        .then((device: Device) => {
          this.ble.stopDeviceScan()
          device.discoverAllServicesAndCharacteristics()
          device.monitorCharacteristicForService(
            serialUUIDs.serviceUUID,
            serialUUIDs.txUUID,
            (err, characteristic) => {
              if (err) console.log(err)
              if (characteristic && characteristic.value) {
                tokenCollector.next(Buffer.from(characteristic.value, 'base64').toString('ascii'))
              resolve(interaction)
            })
    })
  }

  async send(d: DeviceDesc, token: JSONWebToken<JWTEncodable>) {
    return writeAll(200)(
      async (toWrite: string) => {
        this.ble.writeCharacteristicWithResponseForDevice(
          d.id,
          serialUUIDs.serviceUUID,
          serialUUIDs.rxUUID,
          toWrite
        )
      }
    )(
      Buffer.from(token.encode() + '\n', 'ascii').toString('base64')
    )
  }

  startDeviceScan(cb: (device: DeviceDesc) => void) {
    this.ble.startDeviceScan(
      [serialUUIDs.serviceUUID],
      null,
      (error, device) => {
        if (error) console.log(error.toString()) // TODO FIXME
        if (device && device.name) cb({ id: device.id, name: device.name })
      },
    )
  }

  openSerialConnection(
    d: Device,
    onRxDispatch: (send: (token: JSONWebToken<JWTEncodable>) => Promise<any>) => (e: string) => Promise<any>
  ) {
    return d.isConnected().then((connected: any) => {
      if (!connected) throw new Error("Device not connected")

      const tokenCollector = waitForToken('\n')(
        onRxDispatch(
            .then(_ => d.cancelConnection())
        )
      )('')

      tokenCollector.next('')

      d.monitorCharacteristicForService(
        serialUUIDs.serviceUUID,
        serialUUIDs.txUUID,
        (err, characteristic) => {
          if (err) console.log(err)
          if (characteristic && characteristic.value)
            tokenCollector.next(Buffer.from(characteristic.value, 'base64').toString('ascii'))
        })
    })
  }
}

createProtocol(protoGen, interaction) {
  const send = token => interaction.peerMap[token.audience].send(token)
  const p = protoGen(send, verify)
