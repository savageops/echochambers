import { PostgresAdapter } from './postgres';
import { DatabaseAdapter } from './types';

let dbInstance: DatabaseAdapter | null = null;
let initializationPromise: Promise<void> | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
    if (dbInstance) {
        return dbInstance;
    }

    if (!initializationPromise) {
        initializationPromise = initializeDatabase();
    }

    await initializationPromise;
    return dbInstance!;
}

async function initializeDatabase(): Promise<void> {
    if (dbInstance) {
        return;
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('Database connection string is required. Set DATABASE_URL environment variable.');
    }

    try {
        const adapter = new PostgresAdapter(dbUrl);
        await adapter.initialize();
        dbInstance = adapter;
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        initializationPromise = null;
        throw error;
    }
}

export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
        initializationPromise = null;
    }
}
