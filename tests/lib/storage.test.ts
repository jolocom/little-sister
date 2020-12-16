//import { groupAttributesByCredentialId } from '../../src/lib/storage/utils'
//import {
//  CredentialEntity,
//  VerifiableCredentialEntity,
//} from '@jolocom/sdk/js/src/lib/storage/entities'
//
//
describe('lib/storage', () => {
  it('should be tested in @jolocom/sdk-storage-typeorm', () => {
    // NOTE FIXME TODO
    // this test is disabled because should be moved into @jolocom/sdk-storage-typeorm
    expect(true).toBe(true)
  })

//  jest.unmock('src/lib/storage/storage')
//  jest.mock('src/lib/storage/entities', () => ({}))
//  jest.mock('typeorm/browser', () => ({
//    createConnection: jest.fn().mockResolvedValue({}),
//  }))
//
//  describe('Storage', () => {
//    const Storage = require('src/lib/storage/storage').Storage
//    const config = {}
//
//    describe('initConnection', () => {
//      const createConnection: jest.Mock = require('typeorm/browser')
//        .createConnection
//
//      it('should create only one connection if called multiple times synchronously', async () => {
//        createConnection.mockClear()
//
//        const storage = new Storage(config)
//        storage.initConnection()
//        await storage.initConnection()
//
//        expect(createConnection).toHaveBeenCalledTimes(1)
//      })
//
//      it('should create a new connection if last try failed', async () => {
//        const storage = new Storage(config)
//        createConnection.mockClear()
//        createConnection.mockRejectedValueOnce(false)
//
//        // sync calls will only create connection once
//        storage.initConnection()
//        storage.initConnection()
//
//        try {
//          // this should not attempt to createConnection, but rather return the
//          // previous promise, which is mocked to be rejected
//          await storage.initConnection()
//        } catch (err) {
//          // this should call createConnection again
//          await storage.initConnection()
//        }
//        expect(createConnection).toHaveBeenCalledTimes(2)
//      })
//    })
//    describe('Helper functions', () => {
//      it('Should correctly group credentials by credential id', () => {
//        const credentialEntityTemplate = {
//          propertyName: 'givenName',
//          propertyValue: 'Mark',
//          id: 0,
//          verifiableCredential: {
//            id: '00',
//          } as VerifiableCredentialEntity,
//        }
//
//        const mockCredential: CredentialEntity[] = [
//          credentialEntityTemplate,
//          {
//            ...credentialEntityTemplate,
//            propertyName: 'familyName',
//            propertyValue: 'Musterman',
//          },
//          {
//            ...credentialEntityTemplate,
//            propertyName: 'email',
//            propertyValue: 'test@example.com',
//            verifiableCredential: {
//              id: '01',
//            } as VerifiableCredentialEntity,
//          },
//        ]
//
//        expect(groupAttributesByCredentialId(mockCredential)).toStrictEqual([
//          {
//            id: 0,
//            propertyName: 'givenName',
//            propertyValue: ['Mark', 'Musterman'],
//            verifiableCredential: { id: '00' },
//          },
//          {
//            propertyName: 'email',
//            propertyValue: ['test@example.com'],
//            id: 0,
//            verifiableCredential: { id: '01' },
//          },
//        ])
//      })
//    })
//  })
})
