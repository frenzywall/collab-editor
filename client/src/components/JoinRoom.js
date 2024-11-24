import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users } from 'lucide-react';
import './JoinRoom.css'; 

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
    <div className="min-h-screen bg-image flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 4 }} 
        className="w-full max-w-md rounded-2xl shadow-xl border border-white/30 overflow-hidden z-10"
        style={{ background: 'rgba(255, 255, 255, 0.8)' }} 
      >
        <div className="p-8">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 4.4 }} 
            className="text-3xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-3"
          >
            <Users className="w-8 h-8 text-[#333333]" />
            Join Collaborative Space
          </motion.h2>

          {error && (
            <motion.div
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-center shadow-md"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 4.3 }} 
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full p-3 pl-10 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4C8E1] transition-all duration-300 shadow-sm hover:shadow-lg"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 4.5 }} 
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 pl-10 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4C8E1] transition-all duration-300 shadow-sm hover:shadow-lg"
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </motion.div>

            <motion.button
  whileHover={{
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.25)",
    transition: { duration: 0.1 },
  }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 rounded-xl transition-all duration-300 transform hover:bg-gradient-to-l hover:bg-opacity-90 shadow-lg"
>
  Enter Collaborative Space
</motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;