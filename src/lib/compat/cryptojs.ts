/**
 * This is a compatibility layer for decrypting AES encrypted base64 encoded
 * strings from CryptoJS.AES.encrypt
 *
 * based on crypto-js 3.1.9-1
 *
 * The wallet used to depend on crypto-js for en/decryption of the seed, but
 * then migrated to using the jolocom-lib (which uses crypto-browserify). The
 * details of the encryption (IV, key derivation) are slightly different, so
 * previously stored encrypted seeds needed to be re-encrypted.
 *
 */

export const CryptoJS = {
  AES: {
    decrypt: AESDecrypt,
  },
  algo: {
    AES: {
      keySize: 256 / 32,
      ivSize: 128 / 32,
    },
  },
  kdf: {
    OpenSSL: {
      execute: OpenSSLKdfExecute,
    },
  },
  format: {
    OpenSSL: {
      parse: OpenSSLFormatterParse,
    },
  },
}

export default CryptoJS

import { randomBytes, createDecipheriv, createHash } from 'crypto'
import { JolocomLib } from 'jolocom-lib'

/**
 * This function emulates CryptoJS.format.OpenSSL.parse (cipher-core.js)
 * It parses a base64 cipher text and separates the salt bytes if any
 */
function OpenSSLFormatterParse(cipherTextBase64: string) {
  let salt,
    cipherText = Buffer.from(cipherTextBase64, 'base64')
  // Test for salt.
  // If the first 8 bytes are the ASCII "Salted__", then cipherText is salted.
  if (
    cipherText.readUInt32BE(0 * 4) == 0x53616c74 &&
    cipherText.readUInt32BE(1 * 4) == 0x65645f5f
  ) {
    // Extract salt, 8 bytes, third and fourth words
    // NOTE: slice is byte addressed
    salt = cipherText.slice(2 * 4, 4 * 4)
    // Remove salt from ciphertext
    cipherText = cipherText.slice(4 * 4)
  }

  // NOTE: ciphertext small 't' sic from CryptoJS
  return { salt, ciphertext: cipherText }
}

/**
 * This function emulates CryptoJS.kdf.OpenSSL.execute (cipher-core.js)
 * It extracts a key and IV for the AES algorithm
 */
function OpenSSLKdfExecute(
  password: string,
  keySize: number,
  ivSize: number,
  salt: Buffer | undefined,
) {
  // Generate random salt
  if (!salt) {
    salt = randomBytes(64 / 8)
  }

  // Derive key and IV
  let key = EvpKDFCompute(password, salt, { keySize: keySize + ivSize })

  // Separate key and IV
  const iv = key.slice(keySize * 4)
  key = key.slice(0, keySize * 4)

  return { key, iv }
}

/**
 * This function emulates CryptoJS.algo.EvpKDF.compute
 */
function EvpKDFCompute(
  password: string,
  salt: Buffer,
  cfg: { keySize: number },
) {
  // Init hasher
  const newHasher = () => createHash('md5')

  const keySize = cfg.keySize
  // skipped
  // var iterations = cfg.iterations;

  // Initial values
  let derivedKey!: Buffer, block

  // Generate key
  for (let k = 0; k < keySize; k++) {
    const hasher = newHasher()
    if (block) hasher.update(block)
    block = hasher
      .update(password)
      .update(salt)
      .digest()

    // This code is from crypto-js, but iterations is always 1 in our use case
    //// Iterations
    //for (var i = 1; i < iterations; i++) {
    //  block = newHasher().update(block).digest();
    //}

    derivedKey = derivedKey ? Buffer.concat([derivedKey, block]) : block
  }

  return derivedKey.slice(0, keySize * 4)
}

/**
 * This function emulates CryptoJS.AES.decrypt (aes.js), which
 * delegates to PasswordBasedCipher (cipher-core.js)
 *
 * PasswordBasedCipher.cfg = { kdf: OpenSSLKdf }
 * BlockCipher.cfg = { format: OpenSSLFormatter }
 *
 * AES extends BlockCipher
 * OpenSSLFormatter is CryptoJS.format.OpenSSL (cipher-core.js)
 * OpenSSLKdf is CryptoJS.kdf.OpenSSL (cipher-core.js)
 */
export function AESDecrypt(cipherText: string, pass: string) {
  // first it runs format.parse(cipherText), which is OpenSSLFormatter.parse
  const { salt, ciphertext: cipherTextBuffer } = CryptoJS.format.OpenSSL.parse(
    cipherText,
  )

  // then the decryptor generates a key and IV using the default KDF (Key
  // Derivation Function) OpenSSLKdf.execute (cipher-core.js)
  //
  const { keySize, ivSize } = CryptoJS.algo.AES
  const { key, iv } = CryptoJS.kdf.OpenSSL.execute(pass, keySize, ivSize, salt)

  // then calls SerializableCipher.decrypt which creates an aes-256-cbc
  // decryptor using the derived key and IV
  const decipher = createDecipheriv('aes-256-cbc', key, iv)

  return Buffer.concat([decipher.update(cipherTextBuffer), decipher.final()])
}

export function reencryptWithJolocomLib(
  cipherTextBase64: string,
  password: string,
) {
  // NOTE: seed is encrypted as a hex representation, so we convert toString
  // (ascii) and then parse as hex
  const encodedSeed = CryptoJS.AES.decrypt(
    cipherTextBase64,
    password,
  ).toString()
  const seed = Buffer.from(encodedSeed, 'hex')
  const keyProvider = JolocomLib.KeyProvider.fromSeed(seed, password)
  // TODO remove this ts-ignore once encryptedSeed is public
  // @ts-ignore
  return keyProvider.encryptedSeed.toString('hex')
}
