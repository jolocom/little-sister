import {
  PrimaryColumn,
  Entity,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm/browser'
import {
  PersonaEntity,
  SignatureEntity,
  CredentialEntity,
} from 'src/lib/storage/entities'
import {
  Exclude,
  Expose,
  Transform,
  plainToClass,
  classToPlain,
} from 'class-transformer'
import { SignedCredential } from 'jolocom-lib/js/credentials/signedCredential/signedCredential'
import { ISignedCredentialAttrs } from 'jolocom-lib/js/credentials/signedCredential/types'
import { IClaimSection } from 'jolocom-lib/js/credentials/credential/types'

@Exclude()
@Entity('verifiable_credentials')
export class VerifiableCredentialEntity {
  @Expose()
  @Transform(value => JSON.stringify(value), { toClassOnly: true })
  @Transform(value => JSON.parse(value), { toPlainOnly: true })
  @Column()
  '@context'!: string

  @Expose()
  @PrimaryColumn({ length: 50 })
  id!: string

  @Expose()
  @Transform(value => value.split(','), { toPlainOnly: true })
  @Column()
  type!: string

  @Expose()
  @Column({ length: 20, nullable: true })
  name!: string

  @Expose()
  @Column({ length: 75 })
  issuer!: string

  @Expose()
  @Column()
  issued!: Date

  @Expose()
  @Column({ nullable: true })
  expires!: Date

  @Expose()
  @ManyToOne(type => PersonaEntity, persona => persona.did)
  subject!: PersonaEntity

  @OneToMany(type => SignatureEntity, sig => sig.verifiableCredential, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  proof!: SignatureEntity[]

  @OneToMany(type => CredentialEntity, cred => cred.verifiableCredential, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  claim!: CredentialEntity[]

  static fromJSON(json: ISignedCredentialAttrs): VerifiableCredentialEntity {
    return plainToClass(VerifiableCredentialEntity, json)
  }

  // TODO typo
  static fromVerifiableCredential(
    vCred: SignedCredential,
  ): VerifiableCredentialEntity {
    interface ExtendedInterface extends ISignedCredentialAttrs {
      subject: string
    }

    const json = vCred.toJSON() as ExtendedInterface
    json.subject = vCred.subject

    return this.fromJSON(json)
  }

  // TODO handle decryption
  toVerifiableCredential(): SignedCredential {
    const json = classToPlain(this) as any
    const entityData = {
      ...json,
      claim: convertClaimArrayToObject(this.claim, this.subject.did),
      proof: this.proof[0],
    }

    return SignedCredential.fromJSON(entityData)
  }
}

const convertClaimArrayToObject = (
  claims: CredentialEntity[],
  did: string,
): IClaimSection =>
  claims.reduce(
    (acc: IClaimSection, claim: CredentialEntity) => {
      const { propertyName, propertyValue } = claim
      return { ...acc, [propertyName]: propertyValue }
    },
    { id: did },
  )
