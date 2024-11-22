import React, { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import './Editor.css';
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
    <div className="editor-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-panel">
        <div className="users-header">
          <h2>Connected Users</h2>
          <span className="users-count">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
          </span>
        </div>
        <ul className="users-list">
          {activeUsers.map((user, index) => (
            <li key={index} className="user-item">
              <span className="user-status"></span>
              <span className="user-name">{user}</span>
            </li>
          ))}
        </ul>
        {activeUsers.length === 0 && (
          <div className="no-users">
            <p>No active users</p>
          </div>
        )}
      </div>

      <div className="editor-wrapper">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyUp={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          placeholder="Start typing here..."
          className="editor-textarea"
        />
      </div>

      <div className="status-panel">
        {Object.entries(lockedLines).length > 0 && (
          <div className="locked-lines">
            {Object.entries(lockedLines).map(([line, user]) => (
              <div key={line} className="locked-line">
                Line {parseInt(line) + 1} locked by {user}
              </div>
            ))}
          </div>
        )}

        {typingUsers.length > 0 && (
          <div className="typing-status">
            {`${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`}
          </div>
        )}

        <div className="active-users">
          {activeUsers.length > 0
            ? `Active users: ${activeUsers.join(', ')}`
            : 'No active users'}
        </div>
      </div>
    </div>
  );
};

export default Editor;