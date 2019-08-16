import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('master_keys')
export class MasterKeyEntity {
  @PrimaryColumn({ length: 100 })
  encryptedEntropy!: string

  @Column()
  timestamp!: number
}
