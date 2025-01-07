import { config } from 'dotenv';
config();

import { initializeStore } from "./store";
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket, SocketClientToServerEvents, SocketServerToClientEvents, waitForInitialization } from './socket';
import cors from 'cors';
import roomsRouter from './api/rooms';

interface SystemError extends Error {
    code?: string;
}

async function findAvailablePort(startPort: number, endPort: number = startPort + 10): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
        try {
            await new Promise<void>((resolve, reject) => {
                const testServer = createServer();
                testServer.listen(port, () => {
                    testServer.close(() => resolve());
                });
                testServer.on('error', (err: SystemError) => {
                    if (err.code === 'EADDRINUSE') {
                        resolve(); // Port is in use, try next one
                    } else {
                        reject(err);
                    }
                });
            });
            return port;
        } catch (error) {
            console.log(`Port ${port} check failed:`, error);
            continue;
        }
    }
    throw new Error(`No available ports found between ${startPort} and ${endPort}`);
}

async function startServer() {
    try {
        const app = express();
        const httpServer = createServer(app);

        // Find available port first
        const preferredPort = parseInt(process.env.PORT || '3001', 10);
        const port = await findAvailablePort(preferredPort);
        const socketUrl = `http://localhost:${port}`;

        // Configure CORS with dynamic origin
        app.use(cors({
            origin: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', socketUrl],
            methods: ['GET', 'POST'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'x-api-key']
        }));

        app.use(express.json());

        // Initialize Socket.IO with correct types and dynamic origin
        const io = new SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents>(httpServer, {
            cors: {
                origin: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', socketUrl],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        // Mount the rooms router at /api/rooms
        app.use('/api/rooms', roomsRouter);

        // Initialize socket handlers and wait for cache to be ready
        initSocket(io);
        await waitForInitialization();

        // Add a catch-all route handler for debugging
        app.use((req: express.Request, res: express.Response, _next: express.NextFunction) => {
            console.log('404 Not Found:', req.method, req.url);
            res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
        });

        // Start server
        await new Promise<void>((resolve, reject) => {
            httpServer.listen(port, () => {
                const address = httpServer.address();
                if (address && typeof address !== 'string') {
                    console.log(`Server running on port ${port}`);
                    console.log(`Socket.IO URL: ${socketUrl}`);
                    // Set environment variable for client-side use
                    process.env.NEXT_PUBLIC_SOCKET_URL = socketUrl;
                    resolve();
                } else {
                    reject(new Error('Failed to get server address'));
                }
            }).on('error', (err: SystemError) => {
                reject(err);
            });
        });

    } catch (error: unknown) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer().catch(error => {
    console.error('Error starting server:', error);
    process.exit(1);
});

// Export for use in tests
export {};