const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const httpServer = createServer(app);

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

// Function to get the IP address
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

// Define the IP address before using it
const ipAddress = getIPAddress();

const rooms = new Map(); // Store rooms and their user counts
const unlockTimeouts = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    if (!username || !username.trim()) {
      socket.emit('error', 'Invalid username.');
      return;
    }

    username = username.trim();
    console.log(`User |${username}| has joined the room: RoomID {${roomId}}.`);

    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set(),
        content: '',
        lines: [''],
        typingUsers: new Set(),
        lockedLines: {},
        lastEditors: {}, // Track last editors for each line
      });
    }

    const room = rooms.get(roomId);
    room.users.add(username); // Add user to the room
    socket.username = username;

    // Emit the initial state to the user who joined
    socket.emit('initial-state', {
      content: room.content,
      lines: room.lines,
      lockedLines: room.lockedLines,
      users: Array.from(room.users),
      lastEditors: room.lastEditors, // Send last editors info
    });

    // Emit updated user list to all users in the room
    io.to(roomId).emit('users-update', Array.from(room.users));
  });

  socket.on('document-change', ({ roomId, content, lineNumber, lastEditor }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const lines = content.split('\n');

    if (room.lockedLines[lineNumber] && room.lockedLines[lineNumber] !== socket.username) {
      socket.emit('line-locked', {
        lineNumber,
        lockedBy: room.lockedLines[lineNumber],
      });
      return;
    }

    // Update content and lines as before
    room.content = content;
    room.lines = lines;

    // Update the last editor for this line
    room.lastEditors[lineNumber] = lastEditor; // Store the last editor for this line

    // Emit document change to all users in the room
    socket.to(roomId).emit('document-change', content);

    // Emit update about the last editor for this specific line
    socket.to(roomId).emit('update-last-editor', { lineNumber, lastEditor });
  });

  socket.on('lock-line', ({ roomId, lineNumber, username }) => {
    const room = rooms.get(roomId);
    if (!room) return;

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

   rooms.forEach((room, roomId) => {
     if (room.users.has(socket.username)) {
       room.users.delete(socket.username);

       Object.entries(room.lockedLines).forEach(([lineNumber, username]) => {
         if (username === socket.username) {
           delete room.lockedLines[lineNumber];
           io.to(roomId).emit('line-unlocked', { lineNumber });
         }
       });

       room.typingUsers.delete(socket.username);

       const updatedUsers = Array.from(room.users).filter(user => user);
       io.to(roomId).emit('users-update', updatedUsers);
       io.to(roomId).emit('typing', Array.from(room.typingUsers).filter(user => user));
     }
   });
 });

 socket.on('set-username', (username) => {
   socket.username = username;
 });

 socket.on('error', (error) => {
   console.error('Socket error:', error);
 });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
 console.log(`Server running on http://${ipAddress}:${PORT}`);
});

httpServer.on('error', (error) => {
 console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
 console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
 console.error('Unhandled Rejection:', error);
});