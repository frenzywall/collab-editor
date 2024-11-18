import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function UserList({ roomId, username }) {
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'development'
      ? (process.env.REACT_APP_SERVER_URL || 'http://localhost:3001')
      : `${window.location.protocol}//${window.location.hostname}:3001`;

    const newSocket = io(socketUrl, {
      withCredentials: true
    });

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

  return (
    <div>
      <h3>Users in Room</h3>
      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
      {typingUser && <p>{typingUser} is typing...</p>}
    </div>
  );
}

export default UserList;