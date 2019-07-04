import { filters } from './../../src/lib/filterCreds'
import {
  testCreds,
  issuers,
  types,
  getTestDecoratedClaims,
  decoratedTypes,
  numExpiredCreds,
  numValidCreds
} from './testData/filterTestData'
import * as filterDecoratedClaims from 'src/lib/filterDecoratedClaims'
import { getUiCredentialTypeByType } from 'src/lib/util'

describe('Filtering Credentials', () => {
  it('should filter expired creds', () => {
    const now = (new Date()).valueOf()
    const filtered = filters.filterByExpired(testCreds)
    expect(filtered.length).toEqual(numExpiredCreds)
    expect(filtered.every(cred => cred.expires.valueOf() < now)).toBeTruthy()
  })

  it('should filter valid creds', () => {
    const now = (new Date()).valueOf()
    const filtered = filters.filterByValid(testCreds)
    expect(filtered.length).toEqual(numValidCreds)
    expect(filtered.every(cred => cred.expires.valueOf() >= now)).toBeTruthy()
  })

  it('should filter by issuer', () => {
    issuers.forEach(issuer => {
      expect(
        filters
          .filterByIssuer(issuer)(testCreds)
          .every(cred => cred.issuer === issuer),
      ).toBeTruthy()
    })
  })

  it('should filter by type', () => {
    types.forEach(typ => {
      expect(
        filters
          .filterByType(typ)(testCreds)
          .every(cred => cred.type.some(t => t === typ)),
      ).toBeTruthy()
    })
  })

  it('should order by most recent', () => {
    filters.orderByRecent(testCreds).reduce((prev, current) => {
      expect(prev.issued.valueOf()).toBeGreaterThan(current.issued.valueOf())
      return current
    })
  })

  it('should filter documents', () => {
    const documents = types.slice(0, 2)
    expect(
      filters
        .documentFilter(documents)(testCreds)
        .every(cred => cred.type.some(t => documents.some(d => t === d))),
    ).toBeTruthy()
  })
})

describe('Filtering Decorated Claims', () => {
  const testDecoratedClaims = getTestDecoratedClaims()

  it('should filter expired decorated claims', () => {
    const now = (new Date()).valueOf()
    const filtered = filterDecoratedClaims.filters.filterByExpired(testDecoratedClaims)
    expect(filtered.length).toEqual(numExpiredCreds)
    expect(!!filtered.every(claim => !!claim.expires && claim.expires.valueOf() < now)).toBeTruthy()
  })

  it('should filter valid decorated claims', () => {
    const now = (new Date()).valueOf()
    const filtered = filterDecoratedClaims.filters.filterByValid(testDecoratedClaims)
    expect(filtered.length).toEqual(numValidCreds)
    expect(filtered.every(claim => !!claim.expires && claim.expires.valueOf() > now)).toBeTruthy()
  })

  it('should filter by issuer', () => {
    issuers.forEach(issuer => {
      expect(
        filterDecoratedClaims.filters
          .filterByIssuer(issuer)(testDecoratedClaims)
          .every(claim => claim.issuer.did === issuer),
      ).toBeTruthy()
    })
  })

  it('should filter by type', () => {
    decoratedTypes.forEach(typ => {
      const credentialType = getUiCredentialTypeByType(typ)
      expect(
        filterDecoratedClaims.filters
          .filterByType(credentialType)(testDecoratedClaims)
          .every(claim => claim.credentialType === credentialType),
      ).toBeTruthy()
    })
  })
})
