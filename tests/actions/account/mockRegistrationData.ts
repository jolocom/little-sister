import { ISignedCredentialAttrs } from 'jolocom-lib/js/credentials/signedCredential/types'

export default {
  entropy: '2832e89e2d981fb80c7bdb9e6d393cf5',
  didDocument: {
    id: 'did:jolo:mockdid',
    getDID: () => 'did:jolo:mockdid',
  },
  ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
  genericSigningKey: {
    wif: 'KzC5rtJAhUwMDQ6aZm2Luz5JV2VCoSTPuUZtCgmA9rcZ2SY8umUJ',
    path: 'm/0/0',
    keyType: 'ECDSA secp256k1',
  },
  ethereumKey: {
    wif: 'Zm2Luz5JV2VCoSTPuUZtCgmA9rcZ2SY8umUJKzC5rtJAhUwMDQ6a',
    path: 'm/0/1',
    keyType: 'ECDSA secp256k1',
  },
  getPasswordResult: 'fuZJ4DVOSIi5fb+A6A9EDzNADsEWcHSu4jAiiWyYK+Q=',
  decodedWif: {
    privateKey:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    address: '0x5000000000000000000000000000000000000000',
  },
  cipher:
    '6eaee076a473a4b85bb4c7c0cc41af65034538bc6e7206276b7b7b9add24dab30f340ccc4761037bc691b3b0cda9c37f',
  identityWallet: {
    privateIdentityKey: {
      key: Buffer.from(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        'hex',
      ),
      id: 'mock1',
    },
    identity: {
      did: 'did:jolo:mockdid',
    },
    didDocument: {
      did: 'did:jolo:mockdid',
    },
    create: {
      signedCredential: () => 'mockCredential',
    },
    sign: {
      credential: () => 'mockSignedCredential',
    },
  },
  testSignedCredentialDefault: {
    '@context': [
      {
        id: '@id',
        type: '@type',
        cred: 'https://w3id.org/credentials#',
        schema: 'http://schema.org/',
        dc: 'http://purl.org/dc/terms/',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        sec: 'https://w3id.org/security#',
        Credential: 'cred:Credential',
        issuer: { '@id': 'cred:issuer', '@type': '@id' },
        issued: { '@id': 'cred:issued', '@type': 'xsd:dateTime' },
        claim: { '@id': 'cred:claim', '@type': '@id' },
        credential: { '@id': 'cred:credential', '@type': '@id' },
        expires: { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
        proof: { '@id': 'sec:proof', '@type': '@id' },
        EcdsaKoblitzSignature2016: 'sec:EcdsaKoblitzSignature2016',
        created: { '@id': 'dc:created', '@type': 'xsd:dateTime' },
        creator: { '@id': 'dc:creator', '@type': '@id' },
        domain: 'sec:domain',
        nonce: 'sec:nonce',
        signatureValue: 'sec:signatureValue',
      },
      {
        ProofOfEmailCredential:
          'https://identity.jolocom.com/terms/ProofOfEmailCredential',
        schema: 'http://schema.org/',
        email: 'schema:email',
      },
    ],
    id: 'claimId:61adc6e7b1448',
    name: 'Email address',
    issuer:
      'did:jolo:b310d293aeac8a5ca680232b96901fe85988fde2860a1a5db69b49762923cc88',
    type: ['Credential', 'ProofOfEmailCredential'],
    claim: {
      email: 'test@jolocom.com',
      id:
        'did:jolo:b310d293aeac8a5ca680232b96901fe85988fde2860a1a5db69b49762923cc88',
    },
    issued: '2018-10-15T19:59:38.405Z',
    expires: '2019-10-15T19:59:38.406Z',
    proof: {
      type: 'EcdsaKoblitzSignature2016',
      created: '2018-10-15T19:59:38.406Z',
      creator:
        'did:jolo:b310d293aeac8a5ca680232b96901fe85988fde2860a1a5db69b49762923cc88#keys-1',
      nonce: 'c9c8bc35382ff',
      signatureValue:
        'XdEIMGeo+b3eJEb2I063iLwShhAbWQNiwPILRy5XtN0TgU/bUB2mATmYrWGGIJfNbUEwh+kMn/gAQLLXoqr17A==',
    },
  } as ISignedCredentialAttrs,
}
