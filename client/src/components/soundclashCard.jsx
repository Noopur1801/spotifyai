import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SoundclashCard = ({ loungeId, userId, candidates }) => {
   const [votes, setVotes] = useState({});
   const [totalVotes, setTotalVotes] = useState(0);
   const [socket, setSocket] = useState(null);

   useEffect(() => {
      // Connect to your Express backend WebSocket server
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Join the specific lounge room
      newSocket.emit('join_lounge', { loungeId, userId });

      // Listen for live vote count broadcasts from the server
      newSocket.on('soundclash.vote.update', (data) => {
         setVotes(data.tallies);
         setTotalVotes(data.totalVotes);
      });

      // Cleanup socket connection on component unmount
      return () => newSocket.disconnect();
   }, [loungeId, userId]);

   const handleVote = (trackId) => {
      if (socket) {
         socket.emit('soundclash.vote', { loungeId, userId, trackId });
      }
   };

   return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white max-w-md mx-auto shadow-xl">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold tracking-wide text-indigo-400">⚡ Soundclash Live Battle</h3>
            <span className="text-xs bg-indigo-900 text-indigo-200 px-2.5 py-1 rounded-full font-medium">
               {totalVotes} Votes Total
            </span>
         </div>

         <div className="space-y-4">
            {candidates.map((track) => {
               const trackVotes = votes[track._id] || 0;
               const percentage = totalVotes > 0 ? Math.round((trackVotes / totalVotes) * 100) : 0;

               return (
                  <div key={track._id} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
                     <div className="flex justify-between items-center mb-2">
                        <div>
                           <h4 className="font-semibold text-sm">{track.title}</h4>
                           <p className="text-xs text-slate-400">{track.artist}</p>
                        </div>
                        <button
                           onClick={() => handleVote(track._id)}
                           className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                           Vote ({percentage}%)
                        </button>
                     </div>

                     {/* Dynamic Progress Bar */}
                     <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                           className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out"
                           style={{ width: `${percentage}%` }}
                        ></div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default SoundclashCard;