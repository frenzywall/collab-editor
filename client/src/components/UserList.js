import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const UserList = ({ roomId, username }) => {
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'development'
      ? (process.env.REACT_APP_SERVER_URL || 'http://localhost:3001')
      : `${window.location.protocol}//${window.location.hostname}:3001`;

    const newSocket = io(socketUrl, {
      withCredentials: true
    });

    newSocket.emit('join-room', { roomId, username });

    newSocket.on('typing', (typingUser) => {
      setTypingUser(typingUser);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, username]);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      {/* Display typing indicator */}
      {typingUser && typingUser !== username && (
        <p className="text-sm text-gray-600 mt-2 italic">
          {typingUser} is typing...
        </p>
      )}
    </div>
  );
};

export default UserList;