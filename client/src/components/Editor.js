import React, { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
const getSocketUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

const socketUrl = getSocketUrl();
const Editor = ({ roomId, username }) => {
  const [content, setContent] = useState('');
  const [lockedLines, setLockedLines] = useState({});
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const unlockTimeoutRef = useRef({});
  const [localCursorPosition, setLocalCursorPosition] = useState(0);

  useEffect(() => {
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    setSocket(newSocket);

    const handleConnect = () => {
      console.log('Connected to server');
      newSocket.emit('join-room', { roomId, username });
      newSocket.emit('set-username', username);
    };

    const handleInitialState = ({ content, lockedLines, users }) => {
      setContent(content);
      setLockedLines(lockedLines);
      setActiveUsers(users);
    };

    const handleDocumentChange = (newContent) => {
      setContent(newContent);
    };

    const handleLineLockedChange = ({ lineNumber, lockedBy }) => {
      setLockedLines((prev) => ({
        ...prev,
        [lineNumber]: lockedBy,
      }));
    };

    const handleLineUnlocked = ({ lineNumber }) => {
      setLockedLines((prev) => {
        const updated = { ...prev };
        delete updated[lineNumber];
        return updated;
      });
    };

    const handleUsersUpdate = (users) => {
      setActiveUsers(users);
    };

    const handleTyping = (users) => {
      setTypingUsers(users);
    };

    const handleError = (error) => {
      setError(error.message);
      console.error('Socket error:', error);
    };

    // Register event listeners
    newSocket.on('connect', handleConnect);
    newSocket.on('initial-state', handleInitialState);
    newSocket.on('document-change', handleDocumentChange);
    newSocket.on('line-locked', handleLineLockedChange);
    newSocket.on('line-unlocked', handleLineUnlocked);
    newSocket.on('users-update', handleUsersUpdate);
    newSocket.on('typing', handleTyping);
    newSocket.on('error', handleError);

    // Cleanup function
    return () => {
      Object.values(unlockTimeoutRef.current).forEach(clearTimeout);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      newSocket.disconnect();
    };
  }, [roomId, username]);

  const getLineNumberFromCursor = useCallback((textarea) => {
    if (!textarea) return 0;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    return textBeforeCursor.split('\n').length - 1;
  }, []);

  const handleTextChange = useCallback((e) => {
    const textarea = e.target;
    const newContent = textarea.value;
    const lineNumber = getLineNumberFromCursor(textarea);

    if (lockedLines[lineNumber] && lockedLines[lineNumber] !== username) {
      e.preventDefault();
      setError(`${lockedLines[lineNumber]} is editing line ${lineNumber + 1}, wait for them to finish typing..`);
      return;
    }

    setError(null);
    setContent(newContent);

    socket?.emit('document-change', {
      roomId,
      content: newContent,
      lineNumber,
    });

    socket?.emit('lock-line', {
      roomId,
      lineNumber,
      username,
    });

    if (unlockTimeoutRef.current[lineNumber]) {
      clearTimeout(unlockTimeoutRef.current[lineNumber]);
    }

    unlockTimeoutRef.current[lineNumber] = setTimeout(() => {
      socket?.emit('unlock-line', { roomId, lineNumber });
    }, 3000);
  }, [socket, roomId, username, lockedLines, getLineNumberFromCursor]);

  const handleCursorPositionChange = useCallback((e) => {
    setLocalCursorPosition(e.target.selectionStart);
  }, []);

  return (
    <div className="min-h-screen w-full p-5 flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Connected Users</h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
          </span>
        </div>
        <ul className="space-y-2">
          {activeUsers.map((user, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-700 font-medium">{user}</span>
            </li>
          ))}
        </ul>
        {activeUsers.length === 0 && (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active users</p>
          </div>
        )}
      </div>

      <div className="flex-grow relative flex flex-col min-h-[60vh]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyUp={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder="Start typing here..."
          className="w-full h-full p-4 text-base resize-none border rounded-lg focus:ring-3 focus:ring-blue-500"
          style={{ minHeight: '300px' }}
        />
      </div>

      <div className="mt-4 space-y-2 bg-white rounded-lg shadow p-4">
        {Object.entries(lockedLines).length > 0 && (
          <div className="text-sm text-gray-600">
            {Object.entries(lockedLines).map(([line, user]) => (
              <div key={line}>{user} is typing on line {parseInt(line) + 1} wait for them to finish typing...</div>
            ))}
          </div>
        )}

        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500">
            {`${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`}
          </div>
        )}

        <div className="text-sm text-gray-500">
          {activeUsers.length > 0
            ? `Active users: ${activeUsers.join(', ')}`
            : 'No active users'}
        </div>
      </div>
    </div>
  );
};

export default Editor;
