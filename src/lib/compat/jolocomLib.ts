import {
  createHash,
  createCipher,
  createCipheriv,
  createDecipher,
  createDecipheriv,
  randomBytes,
} from 'crypto'

// https://github.com/jolocom/jolocom-lib/blob/v3.0.1/ts/vaultedKeyProvider/softwareProvider.ts#L168
export const encryptWithLib3 = (message: Buffer, password: string) => {
  const cipher = createCipher('aes-256-cbc', password)
  return Buffer.concat([cipher.update(message), cipher.final()])
}

// https://github.com/jolocom/jolocom-lib/blob/v3.0.1/ts/vaultedKeyProvider/softwareProvider.ts#L180
export const decryptWithLib3 = (message: Buffer, password: string) => {
  const decipher = createDecipher('aes-256-cbc', password)
  return Buffer.concat([decipher.update(message), decipher.final()])
}

// @dev https://github.com/jolocom/jolocom-lib/blob/release/4.0.2/ts/vaultedKeyProvider/softwareProvider.ts#L250
export const encryptWithLib4 = async (message: Buffer, password: string) => {
  const iv = await randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', normalizePassword(password), iv)
  return Buffer.concat([iv, cipher.update(message), cipher.final()])
}

// @dev https://github.com/jolocom/jolocom-lib/blob/release/4.0.2/ts/vaultedKeyProvider/softwareProvider.ts#L262
export const decryptWithLib4 = (message: Buffer, password: string) => {
  const IV_LENGTH = 16
  const iv = message.slice(0, IV_LENGTH)
  const cipherText = message.slice(IV_LENGTH)

  const decipher = createDecipheriv(
    'aes-256-cbc',
    normalizePassword(password),
    iv,
  )
  return Buffer.concat([decipher.update(cipherText), decipher.final()])
}

// @dev https://github.com/jolocom/jolocom-lib/blob/release/4.0.2/ts/vaultedKeyProvider/softwareProvider.ts#L369
const normalizePassword = (password: string) =>
  password.length === 32
    ? password
    : createHash('sha256')
        .update(password)
        .digest()
