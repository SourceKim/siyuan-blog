import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

// 如果需要将个人信息存储在数据库中
@Entity('about_me')
export class AboutMeEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, default: 'default' })
  profileKey!: string // 用于标识唯一的个人资料记录

  @Column()
  name!: string

  @Column()
  avatarUrl!: string

  @Column({ type: 'text' })
  bio!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
