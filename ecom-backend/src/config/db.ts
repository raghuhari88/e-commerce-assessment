import knex from 'knex';
import knexConfig from '../../knexfile';

const env = (process.env.NODE_ENV as keyof typeof knexConfig) || 'development';
export const db = knex(knexConfig[env]);

export default db;