import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/entities/user.entity'

@Entity('bg_profile')
export class Bg_profileEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  fileName: string

  @Column()
  originalName: string

  @Column()
  size: number

  @Column()
  mimetype: string

  @ManyToOne(() => UserEntity, user => user.bgProfile)
  user: { id: number }

  @CreateDateColumn()
  createAt: Date

  @UpdateDateColumn()
  updateAt: Date
}
