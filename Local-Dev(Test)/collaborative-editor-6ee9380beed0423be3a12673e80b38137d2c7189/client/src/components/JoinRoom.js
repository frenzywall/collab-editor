import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, Send } from 'lucide-react';

const JoinRoom = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId || !username.trim()) {
      setError('Both Room ID and Username are required');
    } else {
      setError('');
      onJoin(roomId, username.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/30 overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              Collaborative Space
            </h2>
            <p className="text-gray-500 mt-2">Join a collaborative editing session</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ x: -10 }}
              animate={{ x: [0, -10, 0, 10, 0] }}
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg flex items-center"
            >
              <Lock className="mr-2 text-red-400" size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 transition-all duration-300"
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 transition-all duration-300"
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 rounded-xl hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Join Collaborative Space</span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;