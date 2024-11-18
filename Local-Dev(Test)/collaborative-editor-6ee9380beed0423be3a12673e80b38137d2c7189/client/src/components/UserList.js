import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function UserList({ roomId, username }) {
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.emit('join-room', { roomId, username });

    newSocket.on('users-update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    newSocket.on('typing', (typingUser) => {
      setTypingUser(typingUser);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username]);

}

export default UserList;
