import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'

@Entity('bg_profile')
export class Bg_profileEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => UserEntity, user => user.bgProfile)
  user: { id: number }

  @Column({ default: 0 })
  bgId: number
}
