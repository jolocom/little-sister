import {Entity,  Column, PrimaryColumn} from 'typeorm/browser'
import {Expose} from 'class-transformer'

@Entity('cache')
@Expose()
export class CacheEntity {
  @PrimaryColumn()
  key!: string

  @Column({nullable: false, type: 'simple-json'})
  value!: string
}
