const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');
const client = require('prom-client');

const app = express();
const httpServer = createServer(app);

// Initialize prometheus registry
const register = new client.Registry();

// Enable default metrics with custom prefix
client.collectDefaultMetrics({
  register,
  timeout: 5000,
  prefix: 'node_'
});

const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return [
      'http://client:3000',      
      'http://localhost:3000',   
      /^http:\/\/\d+\.\d+\.\d+\.\d+:3000$/  
    ];
  }
  return ['http://localhost:3000'];
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      const isAllowed = !origin || allowedOrigins.some(allowed => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return origin === allowed;
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Application State
const rooms = new Map();
const unlockTimeouts = new Map();

// Network interfaces
const getIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return 'localhost';
};

const ipAddress = getIPAddress();

// WebSocket Metrics
const wsConnectionsGauge = new client.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections',
  registers: [register]
});

const wsConnectionsTotal = new client.Counter({
  name: 'websocket_connections_total',
  help: 'Total number of WebSocket connections made',
  registers: [register]
});

const wsDisconnectsTotal = new client.Counter({
  name: 'websocket_disconnects_total',
  help: 'Total number of WebSocket disconnections',
  registers: [register]
});

// Room Metrics
const roomCountGauge = new client.Gauge({
  name: 'room_count',
  help: 'Number of active rooms',
  registers: [register]
});

const userCountGauge = new client.Gauge({
  name: 'total_users',
  help: 'Total number of users across all rooms',
  registers: [register]
});

const usersPerRoomGauge = new client.Gauge({
  name: 'users_per_room',
  help: 'Number of users in each room',
  labelNames: ['room_id'],
  registers: [register]
});

// Document Metrics
const documentChangesCounter = new client.Counter({
  name: 'document_changes_total',
  help: 'Total number of document changes',
  labelNames: ['room_id'],
  registers: [register]
});

const documentChangeSizeHistogram = new client.Histogram({
  name: 'document_change_size_bytes',
  help: 'Size of document changes in bytes',
  buckets: [100, 500, 1000, 5000, 10000],
  registers: [register]
});

// Line Lock Metrics
const lineLocksCounter = new client.Counter({
  name: 'line_locks_total',
  help: 'Total number of line locks requested',
  labelNames: ['room_id'],
  registers: [register]
});

const lineLockDurationHistogram = new client.Histogram({
  name: 'line_lock_duration_seconds',
  help: 'Duration of line locks',
  buckets: [0.5, 1, 2, 5, 10],
  registers: [register]
});

// Network Metrics
const networkBytesCounter = new client.Counter({
  name: 'network_bytes_total',
  help: 'Total bytes transferred',
  labelNames: ['direction'], // 'in' or 'out'
  registers: [register]
});

const networkLatencyHistogram = new client.Histogram({
  name: 'network_latency_seconds',
  help: 'Network latency for WebSocket messages',
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5],
  registers: [register]
});

// Error Metrics
const errorCounter = new client.Counter({
  name: 'error_total',
  help: 'Total number of errors',
  labelNames: ['type'],
  registers: [register]
});

// Update metrics periodically
setInterval(() => {
  // Room and user metrics
  let totalUsers = 0;
  rooms.forEach((room, roomId) => {
    totalUsers += room.users.size;
    usersPerRoomGauge.set({ room_id: roomId }, room.users.size);
  });
  
  userCountGauge.set(totalUsers);
  roomCountGauge.set(rooms.size);
  wsConnectionsGauge.set(io.engine.clientsCount || 0);

  // System metrics
  const networkStats = os.networkInterfaces();
  Object.values(networkStats).forEach(interfaces => {
    interfaces.forEach(iface => {
      if (!iface.internal && iface.family === 'IPv4') {
        networkBytesCounter.inc({ direction: 'in' }, iface.bytesReceived || 0);
        networkBytesCounter.inc({ direction: 'out' }, iface.bytesSent || 0);
      }
    });
  });
}, 5000);

// WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  wsConnectionsTotal.inc();
  wsConnectionsGauge.inc();

  const messageTimestamps = new Map();

  socket.on('join-room', ({ roomId, username }) => {
    if (!username || !username.trim()) {
      socket.emit('error', 'Invalid username.');
      errorCounter.inc({ type: 'invalid_username' });
      return;
    }

    username = username.trim();
    console.log(`User |${username}| has joined the room: RoomID {${roomId}}.`);

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        content: '',
        lines: [''],
        typingUsers: new Set(),
        lockedLines: {},
      });
    }

    const room = rooms.get(roomId);
    room.users.add(username);
    socket.username = username;
    socket.roomId = roomId;

    socket.emit('initial-state', {
      content: room.content,
      lines: room.lines,
      lockedLines: room.lockedLines,
      users: Array.from(room.users),
    });

    io.to(roomId).emit('users-update', Array.from(room.users));
    usersPerRoomGauge.set({ room_id: roomId }, room.users.size);
  });

  socket.on('document-change', ({ roomId, content, lineNumber }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const lines = content.split('\n');
    const contentSize = Buffer.byteLength(content, 'utf8');

    documentChangesCounter.inc({ room_id: roomId });
    documentChangeSizeHistogram.observe(contentSize);
    networkBytesCounter.inc({ direction: 'in' }, contentSize);

    if (room.lockedLines[lineNumber] && room.lockedLines[lineNumber] !== socket.username) {
      socket.emit('line-locked', {
        lineNumber,
        lockedBy: room.lockedLines[lineNumber],
      });
      return;
    }

    room.content = content;
    room.lines = lines;
    socket.to(roomId).emit('document-change', content);
    networkBytesCounter.inc({ direction: 'out' }, contentSize * room.users.size);
  });

  socket.on('lock-line', ({ roomId, lineNumber, username }) => {
    const startTime = Date.now();
    const room = rooms.get(roomId);
    if (!room) return;

    lineLocksCounter.inc({ room_id: roomId });

    const timeoutKey = `${roomId}-${lineNumber}`;
    if (unlockTimeouts.has(timeoutKey)) {
      clearTimeout(unlockTimeouts.get(timeoutKey));
    }

    if (!room.lockedLines[lineNumber] || room.lockedLines[lineNumber] === username) {
      room.lockedLines[lineNumber] = username;
      io.to(roomId).emit('line-locked', { lineNumber, lockedBy: username });

      const timeoutId = setTimeout(() => {
        if (room.lockedLines[lineNumber] === username) {
          delete room.lockedLines[lineNumber];
          io.to(roomId).emit('line-unlocked', { lineNumber });
          unlockTimeouts.delete(timeoutKey);
          lineLockDurationHistogram.observe((Date.now() - startTime) / 1000);
        }
      }, 2000);

      unlockTimeouts.set(timeoutKey, timeoutId);
    }
  });

  socket.on('unlock-line', ({ roomId, lineNumber }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const timeoutKey = `${roomId}-${lineNumber}`;
    if (unlockTimeouts.has(timeoutKey)) {
      clearTimeout(unlockTimeouts.get(timeoutKey));
      unlockTimeouts.delete(timeoutKey);
    }

    if (room.lockedLines[lineNumber] === socket.username) {
      delete room.lockedLines[lineNumber];
      io.to(roomId).emit('line-unlocked', { lineNumber });
    }
  });

  socket.on('typing', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.typingUsers.add(username);
    socket.to(roomId).emit('typing', Array.from(room.typingUsers));

    setTimeout(() => {
      if (room.typingUsers.has(username)) {
        room.typingUsers.delete(username);
        socket.to(roomId).emit('typing', Array.from(room.typingUsers));
      }
    }, 2000);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected.`);
    wsConnectionsGauge.dec();
    wsDisconnectsTotal.inc();

    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room && room.users.has(socket.username)) {
        room.users.delete(socket.username);
        usersPerRoomGauge.set({ room_id: socket.roomId }, room.users.size);

        Object.entries(room.lockedLines).forEach(([lineNumber, username]) => {
          if (username === socket.username) {
            delete room.lockedLines[lineNumber];
            io.to(socket.roomId).emit('line-unlocked', { lineNumber });
          }
        });

        room.typingUsers.delete(socket.username);

        const updatedUsers = Array.from(room.users).filter(user => user);
        io.to(socket.roomId).emit('users-update', updatedUsers);
        io.to(socket.roomId).emit('typing', Array.from(room.typingUsers).filter(user => user));
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    errorCounter.inc({ type: 'socket_error' });
  });
});


app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  try {
    res.end(await register.metrics());
  } catch (err) {
    errorCounter.inc({ type: 'metrics_endpoint_error' });
    res.status(500).end(err);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    connections: io.engine.clientsCount,
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://${ipAddress}:${PORT}`);
});

httpServer.on('error', (error) => {
  console.error('Server error:', error);
  errorCounter.inc({ type: 'server_error' });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  errorCounter.inc({ type: 'uncaught_exception' });
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  errorCounter.inc({ type: 'unhandled_rejection' });
});