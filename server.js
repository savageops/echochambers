const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Create WebSocket server attached to the same HTTP server
  const wss = new WebSocket.Server({ server });

  // Store rooms and their connections
  const rooms = new Map();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roomId = url.searchParams.get('roomId');
    
    if (!roomId) {
      ws.close();
      return;
    }

    // Add connection to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    console.log(`Client connected to room ${roomId}`);

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        // Broadcast to all clients in the room except sender
        const roomClients = rooms.get(roomId);
        if (roomClients) {
          roomClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log(`Client disconnected from room ${roomId}`);
      const roomClients = rooms.get(roomId);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(roomId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  const PORT = parseInt(process.env.PORT, 10) || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log('> WebSocket server is running');
  });
});
