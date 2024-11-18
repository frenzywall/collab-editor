import React, { useState } from 'react';

function JoinRoom({ onJoin }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || !username.trim()) {
      setError('Both Room ID and Username are required');
    } else {
      setError('');  
      onJoin(roomId, username.trim());  // Ensure no leading/trailing spaces are included
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4">Join Collaborative Editor</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Room-ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Join Room :)
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;
