import { DatabaseAdapter } from './types';
import { SQLiteAdapter } from './sqlite';
import { PostgresAdapter } from './postgres';
import path from 'path';

export async function createAdapter(): Promise<DatabaseAdapter> {
  const dbType = process.env.DATABASE_TYPE;
  let adapter: DatabaseAdapter;
  
  switch (dbType) {
    case 'postgres':
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
      }
      adapter = new PostgresAdapter(process.env.DATABASE_URL);
      break;
    case 'sqlite':
    default:
      const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'chat.db');
      adapter = new SQLiteAdapter(dbPath);
  }
  
  await adapter.initialize();
  return adapter;
}

export type { DatabaseAdapter };
export { SQLiteAdapter, PostgresAdapter };