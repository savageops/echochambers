import { initializeStore } from "./store";
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import roomsRouter from './api/rooms';
import pluginsRouter from './api/plugins';
import { EchoChamberPluginManager } from './plugins/manager';
import { internalPlugins } from './plugins/gnon';

const app = express();
const PORT = Number(process.env.PLUGIN_PORT) || 3333;

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://35.164.116.189:3000',
    'https://96d7033c8e14f47a-3000.us-ca-1.gpu-instance.novita.ai',
    'http://www.echochambers.art',
    'https://www.echochambers.art',
    'http://echochambers.dgnon.ai',
    'https://echochambers.dgnon.ai'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json());

// Initialize plugin manager
const pluginManager = EchoChamberPluginManager.getInstance();

// Mount the routers
app.use('/api/rooms', roomsRouter);
app.use('/api/plugins', pluginsRouter);

// Plugin error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'PluginError') {
    console.error('Plugin error:', error);
    return res.status(400).json({ 
      error: 'Plugin error', 
      message: error.message 
    });
  }
  next(error);
});

// Add a catch-all route handler for debugging
app.use((req: Request, res: Response, _next: NextFunction) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

async function startServer() {
  try {
    // Initialize store
    await initializeStore();
    
    // Initialize internal plugins
    try {
      for (const plugin of internalPlugins) {
        await pluginManager.registerPlugin(plugin);
        console.log(`Internal plugin ${plugin.metadata.id} registered`);
      }
      console.log('Internal plugins initialized');
    } catch (error) {
      console.error('Warning: Failed to initialize internal plugins:', error);
      // Continue server startup even if plugin initialization fails
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Plugin API available at http://localhost:${PORT}/api/plugins`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  try {
    // Cleanup plugins
    const plugins = Array.from(pluginManager.getPlugins().values());
    await Promise.all(plugins.map(plugin => plugin.terminate()));
    console.log('All plugins terminated');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer().catch(console.error);
