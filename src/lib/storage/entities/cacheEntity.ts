import { Entity, Column, PrimaryColumn } from 'typeorm'
import { Expose } from 'class-transformer'

@Entity('cache')
@Expose()
export class CacheEntity {
  @PrimaryColumn()
  key!: string

  @Column({ nullable: false, type: 'simple-json' })
  value!: any
}
