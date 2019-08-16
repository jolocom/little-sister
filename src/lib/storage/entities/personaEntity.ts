import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('personas')
export class PersonaEntity {
  @Column()
  controllingKeyPath!: string

  @PrimaryColumn({ length: 75 })
  did!: string
}
