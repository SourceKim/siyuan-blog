import { DataSource } from 'typeorm'
import { config } from '../config'

console.log(config)

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  charset: 'utf8mb4',
  timezone: '+08:00',
  extra: {
    connectionLimit: 10,
  },
}) 