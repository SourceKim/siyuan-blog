import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

// 如果需要本地缓存笔记本信息
@Entity('notebooks')
export class NotebookEntity {
  @PrimaryGeneratedColumn()
  autoId!: number

  @Column({ unique: true })
  id!: string

  @Column()
  name!: string

  @Column()
  sort!: number

  @Column()
  sortMode!: number

  @Column({ nullable: true })
  icon!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 如果需要本地缓存文档信息
@Entity('docs')
export class DocEntity {
  @PrimaryGeneratedColumn()
  autoId!: number

  @Column({ unique: true })
  id!: string

  @Column()
  path!: string

  @Column()
  name!: string

  @Column()
  sort!: number

  @Column({ nullable: true })
  icon!: string

  @Column()
  notebookId!: string

  @Column({ type: 'bigint' })
  mtime!: number

  @Column({ type: 'bigint' })
  ctime!: number

  @Column()
  subFileCount!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

// 如果需要本地缓存笔记内容
@Entity('notes')
export class NoteEntity {
  @PrimaryGeneratedColumn()
  autoId!: number

  @Column({ unique: true })
  id!: string

  @Column({ type: 'longtext' })
  content!: string

  @Column()
  path!: string

  @Column({ type: 'bigint' })
  lastSyncTime!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
