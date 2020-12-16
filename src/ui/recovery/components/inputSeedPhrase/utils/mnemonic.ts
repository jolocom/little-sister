const bip39 = require('bip39')

export const getSuggestedSeedKeys = (chars: string) => {
  return bip39.wordlists.EN.filter((word: string): boolean => {
    return word.startsWith(chars.trim())
  })
}

export const isKeyValid = (key: string) => {
  return Boolean(bip39.wordlists.EN.find((word: string) => word === key))
}
