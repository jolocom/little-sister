import {Entity,  Column, PrimaryColumn} from 'typeorm/browser'

@Entity('cache')
export class CacheEntity {
  @PrimaryColumn()
  key!: string

  @Column({nullable: false, type: 'simple-json'})
  value!: string
}
