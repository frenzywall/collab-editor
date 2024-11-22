import React, { useState } from 'react';
import Editor from './components/Editor';
import JoinRoom from './components/JoinRoom';
import UserList from './components/UserList';

function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const handleJoinRoom = (room, user) => {
    setRoomId(room);
    setUsername(user);
    setJoined(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {!joined ? (
        <JoinRoom onJoin={handleJoinRoom} />
      ) : (
        <div className="flex h-full">
          <UserList roomId={roomId} />
          <Editor roomId={roomId} username={username} />
        </div>
      )}
    </div>
  );
}

export default App;