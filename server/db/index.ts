import dotenv from 'dotenv';
import { DatabaseAdapter } from './types';
import { SQLiteAdapter } from './sqlite';
import { PostgresAdapter } from './postgres';

dotenv.config();

export async function createAdapter(): Promise<DatabaseAdapter> {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';
  let adapter: DatabaseAdapter;
  
  switch (dbType) {
    case 'postgres':
      adapter = new PostgresAdapter();
      break;
    case 'sqlite':
    default:
      adapter = new SQLiteAdapter();
  }

  console.log(`Using ${dbType} database`);
  
  await adapter.initialize();
  return adapter;
}

export type { DatabaseAdapter };
export { SQLiteAdapter, PostgresAdapter };