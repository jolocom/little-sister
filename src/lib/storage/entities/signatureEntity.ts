import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { plainToClass } from 'class-transformer'
import {
  ILinkedDataSignature,
  ILinkedDataSignatureAttrs,
} from 'jolocom-lib/js/linkedDataSignature/types'
import { VerifiableCredentialEntity } from './verifiableCredentialEntity'

@Entity('signatures')
@Unique(['verifiableCredential', 'signatureValue'])
export class SignatureEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(type => VerifiableCredentialEntity, vCred => vCred.proof)
  verifiableCredential!: VerifiableCredentialEntity

  @Column()
  type!: string

  @Column()
  created!: Date

  @Column()
  creator!: string

  @Column({ nullable: true })
  nonce!: string

  @Column()
  signatureValue!: string

  static fromJSON(json: ILinkedDataSignatureAttrs): SignatureEntity {
    return plainToClass(SignatureEntity, json)
  }

  static fromLinkedDataSignature(lds: ILinkedDataSignature) {
    const json = lds.toJSON() as ILinkedDataSignatureAttrs
    return this.fromJSON(json)
  }
}
