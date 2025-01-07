import { config } from 'dotenv';
config();

import { initializeStore } from "./store";
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket, SocketClientToServerEvents, SocketServerToClientEvents } from './socket';
import cors from 'cors';
import roomsRouter from './api/rooms';

const startServer = async () => {
    const app = express();
    const httpServer = createServer(app);

    // Configure CORS
    app.use(cors({
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'x-api-key']
    }));

    app.use(express.json());

    // Initialize Socket.IO with correct types
    const io = new SocketIOServer<SocketClientToServerEvents, SocketServerToClientEvents>(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    // Mount the rooms router at /api/rooms
    app.use('/api/rooms', roomsRouter);

    // Initialize socket handlers and wait for cache to be ready
    try {
        await initSocket(io);
        console.log('Socket server initialized successfully');
    } catch (error) {
        console.error('Failed to initialize socket server:', error);
        process.exit(1);
    }

    // Add a catch-all route handler for debugging
    app.use((req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.log('404 Not Found:', req.method, req.url);
        res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
    });

    const port = process.env.PORT || 3001;

    httpServer.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Export for use in tests
export {};