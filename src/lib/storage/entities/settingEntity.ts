import { PrimaryColumn, Entity, Column } from 'typeorm'

@Entity('settings')
export class SettingEntity {
  @PrimaryColumn()
  key!: string

  @Column('simple-json')
  value: any
}
