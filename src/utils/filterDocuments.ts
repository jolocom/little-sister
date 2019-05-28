import { DecoratedClaims } from 'src/reducers/account'

const DOC_TYPES = [
  'IdCard',
  'Passport',
  'DrivingLicense',
  'Certificate',
  'EventTicket',
]

export function getDocumentClaims(
  claims: DecoratedClaims[],
): DecoratedClaims[] {
  return claims.filter(claim => DOC_TYPES.includes(claim.credentialType))
}
