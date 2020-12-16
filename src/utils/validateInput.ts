export type InputValidator<T> = (input: T) => boolean

const passesAll = <T>(iv: InputValidator<T>[]) => (value: T) =>
  iv.every(fn => fn(value))

const isStringLengthValid = (maxLen: number): InputValidator<string> => (
  input,
): boolean => input.length < maxLen && input.length >= 0

const isOnlyNumbers: InputValidator<string> = input =>
  /^\+?(0|[1-9]\d*)$/.test(input)

const naiveEmailFormat: InputValidator<string> = input =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)

const isAddressFieldValid = isStringLengthValid(100)
const isNameFieldValid = isStringLengthValid(100)
const isPhoneNumberValid = passesAll([isStringLengthValid(100), isOnlyNumbers])
const isEmailAddressValid = passesAll([
  isStringLengthValid(100),
  naiveEmailFormat,
])

export const inputFieldValidators: {
  [credType: string]: InputValidator<string>
} = {
  Email: isEmailAddressValid,
  Name: isNameFieldValid,
  'Postal Address': isAddressFieldValid,
  'Mobile Phone': isPhoneNumberValid,
}
