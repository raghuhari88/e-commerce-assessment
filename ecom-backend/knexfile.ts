import 'dotenv/config';
import type { Knex } from 'knex';
import path from 'path';

// Knex configuration object
const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'ecommerce'
    },
    migrations: { directory: './src/migrations', extension: 'ts' },
    seeds: { directory: './src/seeds', extension: 'ts' }
  },

  // Uncomment if you plan to deploy
  // production: {
  //   client: 'pg',
  //   connection: process.env.DATABASE_URL,
  //   migrations: {
  //     directory: path.resolve(__dirname, 'migrations'),
  //     extension: 'ts'
  //   },
  //   seeds: {
  //     directory: path.resolve(__dirname, 'seeds'),
  //     extension: 'ts'
  //   }
  // }
};

export default config;