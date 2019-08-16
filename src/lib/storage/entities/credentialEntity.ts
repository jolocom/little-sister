import {
  ManyToOne,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Type, plainToClass } from 'class-transformer'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { IClaimSection } from 'jolocom-lib/js/credentials/credential/types'
import { VerifiableCredentialEntity } from './verifiableCredentialEntity'

interface JsonAttributes {
  propertyName: string
  propertyValue: string
}

@Entity('credentials')
@Unique(['verifiableCredential', 'propertyName'])
export class CredentialEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Type(() => VerifiableCredentialEntity)
  @ManyToOne(type => VerifiableCredentialEntity, vCred => vCred.claim)
  verifiableCredential!: VerifiableCredentialEntity

  @Column({ length: 50 })
  propertyName!: string

  @Column()
  propertyValue!: string

  static fromJSON(json: JsonAttributes): CredentialEntity {
    return plainToClass(CredentialEntity, json)
  }

  // TODO Handle encryption
  static fromVerifiableCredential(vCred: SignedCredential): CredentialEntity[] {
    const credentialSection = vCred.claim
    const presentClaims = Object.keys(credentialSection).find(k => k !== 'id')

    if (!presentClaims) {
      throw new Error('Only entry in the claim is the id.')
    }

    return convertClaimObjectToArray(credentialSection).map(el =>
      this.fromJSON(el),
    )
  }
}

const convertClaimObjectToArray = (
  claimSection: IClaimSection,
): JsonAttributes[] =>
  Object.keys(claimSection)
    .filter(key => key !== 'id')
    .map(key => ({
      propertyName: key,
      propertyValue: claimSection[key] as string,
    }))
