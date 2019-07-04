import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { DecoratedClaims } from 'src/reducers/account'
import { getUiCredentialTypeByType } from 'src/lib/util'

const lastYear = new Date()
lastYear.setFullYear(lastYear.getFullYear() - 1)

const nextYear = new Date()
nextYear.setFullYear(nextYear.getFullYear() + 1)

export const expiryDates = [lastYear, nextYear, nextYear]
export const issuers = ['issuerA', 'issuerB', 'issuerC']
export const types = ['someCred', 'someOtherCred', 'anotherOne']
export const numCreds = expiryDates.length * issuers.length * types.length
export const numExpiredCreds = numCreds / expiryDates.length
export const numValidCreds = numExpiredCreds * 2

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const flatten = <T>(arr: T[][]) => arr.reduce((acc, curr) => [...acc, ...curr])

export const testCreds: SignedCredential[] = flatten(
  expiryDates.map(expiryDate =>
    flatten(
      issuers.map(issuer =>
        types.map(typ => {
          const sc = new SignedCredential()
          const issueTime = new Date(getRandomInt(0, 10000000000))
          sc.expires = expiryDate
          sc.issuer = issuer
          sc.type = [typ]
          sc.issued = issueTime
          return sc
        }),
      ),
    ),
  ),
)

export const decoratedTypes = [
  ['Credential', 'someCred'],
  ['Credential', 'someOtherCred'],
  ['Credential', 'anotherOne'],
]

export const getTestDecoratedClaims = (): DecoratedClaims[] => {
  const claims: DecoratedClaims[] = []
  decoratedTypes.forEach(typ => {
    const credentialType = getUiCredentialTypeByType(typ)
    const newClaim = {
      credentialType,
      id: '',
      subject: '',
      claimData: {}
    }
    claims.push.apply(claims,
      flatten(
        expiryDates.map(expiryDate =>
          issuers.map(issuer => ({
            ...newClaim,
            issuer: { did: issuer },
            expires: expiryDate,
          })),
        ),
      )
    )
  })
  return claims
}
