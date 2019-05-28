import { claimsMetadata } from 'jolocom-lib'
import {
  uiCategoryByCredentialType,
  Categories,
  uiCredentialTypeByType,
} from './categories'
import { BaseMetadata } from 'cred-types-jolocom-core'

import { NativeModules } from 'react-native'
import { DecoratedClaims } from '../reducers/account'
import { equals } from 'ramda'
// this comes from 'react-native-randombytes'
const { RNRandomBytes } = NativeModules

export const getClaimMetadataByCredentialType = (
  type: string,
): BaseMetadata => {
  const uiType = Object.keys(uiCredentialTypeByType).find(
    item => uiCredentialTypeByType[item] === type,
  )
  const relevantType = Object.keys(claimsMetadata).find(
    key => claimsMetadata[key].type[1] === uiType,
  )

  if (!relevantType) {
    throw new Error("Unknown credential type, can't find metadata")
  }

  return claimsMetadata[relevantType]
}

export const getUiCredentialTypeByType = (type: string[]): string =>
  uiCredentialTypeByType[type[1]] || prepareLabel(type[1])

export const getCredentialUiCategory = ({
  credentialType,
}: DecoratedClaims): string => {
  const uiCategories = Object.keys(uiCategoryByCredentialType)

  return (
    uiCategories.find(uiCategory =>
      uiCategoryByCredentialType[uiCategory].some(equals(credentialType)),
    ) || Categories.Other
  )
}

export const prepareLabel = (label: string): string => {
  const words = label.split(/(?=[A-Z0-9])/)
  return words.length > 1 ? words.map(capitalize).join(' ') : capitalize(label)
}

export const capitalize = (word: string): string =>
  `${word[0].toUpperCase()}${word.slice(1)}`

export const compareDates = (date1: Date, date2: Date): number =>
  Math.floor(
    (Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) -
      Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) /
      (1000 * 60 * 60 * 24),
  )

export function generateSecureRandomBytes(length: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    RNRandomBytes.randomBytes(length, (err: string, bytesAsBase64: string) => {
      if (err) reject(err)
      else resolve(Buffer.from(bytesAsBase64, 'base64'))
    })
  })
}
