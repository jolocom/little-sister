import { IpfsCustomConnector } from 'src/lib/ipfs'

describe('Ipfs custom connector', () => {
  const BASE_URL = 'https://test.com:443'

  let ipfsLib: IpfsCustomConnector

  beforeEach(() => {
    ipfsLib = new IpfsCustomConnector({
      host: 'test.com',
      protocol: 'https',
      port: 443,
    })

    // @ts-ignore private 
    ipfsLib.nativeLib.fetch.mockClear()
  })

  it('should be correctly configured', () => {
    // @ts-ignore private 
    expect(ipfsLib.ipfsHost).toBe(BASE_URL)
  })

  it('should correctly attempt to store a JSON document', () => {
    const testJSON = {
      id: 'did:jolo:test',
      publicKeySection: ['first'],
    }

    const expectedArgs = [
      'POST',
      'https://test.com:443/api/v0/add?pin=true',
      { 'Content-Type': 'multipart/form-data' },
      [{ data: JSON.stringify(testJSON), name: 'ddo' }],
    ]

    ipfsLib.storeJSON({ data: testJSON, pin: true })

    // @ts-ignore private 
    expect(ipfsLib.nativeLib.fetch).toHaveBeenCalledTimes(1)
    // @ts-ignore private 
    expect(ipfsLib.nativeLib.fetch).toHaveBeenCalledWith(...expectedArgs)
  })

  it('should correctly attempt to cat JSON document', () => {
    const mockHash = 'mockIpfsHash'
    const expectedArgs = [
      'GET',
      `https://test.com:443/api/v0/cat?arg=${mockHash}`,
    ]

    ipfsLib.catJSON(mockHash)
    // @ts-ignore private 
    expect(ipfsLib.nativeLib.fetch).toHaveBeenCalledWith(...expectedArgs)
  })
})
