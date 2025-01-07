import { DatabaseAdapter } from './types';
import { PostgresAdapter } from './postgres';

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
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
  
  await adapter.initialize();
  return adapter;
}

export type { DatabaseAdapter };
export { PostgresAdapter };