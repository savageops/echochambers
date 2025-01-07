import { config } from 'dotenv';
config();

import { initialize } from "./store";
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket, SocketClientToServerEvents, SocketServerToClientEvents, waitForInitialization } from './socket';
import cors from 'cors';
import roomsRouter from './api/rooms';

interface SystemError extends Error {
    code?: string;
}

async function startServer() {
    try {
        // Initialize store first
        await initialize();

        const app = express();
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        const maxRetries = 3;
        let currentPort = port;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await new Promise((resolve, reject) => {
                    const httpServer = createServer(app);
                    httpServer.on('error', (error: any) => {
                        if (error.code === 'EADDRINUSE') {
                            console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
                            currentPort++;
                            httpServer.close();
                            reject(error);
                        } else {
                            reject(error);
                        }
                    });

                    httpServer.listen(currentPort, () => {
                        console.log(`Server running on port ${currentPort}`);
                        const socketUrl = `http://localhost:${currentPort}`;
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
                        waitForInitialization();

                        // Add a catch-all route handler for debugging
                        app.use((req: express.Request, res: express.Response, _next: express.NextFunction) => {
                            console.log('404 Not Found:', req.method, req.url);
                            res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
                        });

                        console.log(`Socket.IO URL: ${socketUrl}`);
                        // Set environment variable for client-side use
                        process.env.NEXT_PUBLIC_SOCKET_URL = socketUrl;
                        resolve(httpServer);
                    });
                });
                return; // Success, exit the retry loop
            } catch (error: any) {
                if (attempt === maxRetries - 1) {
                    throw new Error(`Failed to start server after ${maxRetries} attempts: ${error.message}`);
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        throw error;
    }
}

startServer().catch(error => {
    console.error('Error starting server:', error);
    process.exit(1);
});

// Export for use in tests
export {};