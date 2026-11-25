import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SoundclashCard = ({ loungeId, userId, candidates }) => {
   const [votes, setVotes] = useState({});
   const [totalVotes, setTotalVotes] = useState(0);
   const [socket, setSocket] = useState(null);

   useEffect(() => {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join_lounge', { loungeId, userId });

      newSocket.on('soundclash.vote.update', (data) => {
         setVotes(data.tallies);
         setTotalVotes(data.totalVotes);
      });

      return () => newSocket.disconnect();
   }, [loungeId, userId]);

   const handleVote = (trackId) => {
      if (socket) {
         socket.emit('soundclash.vote', { loungeId, userId, trackId });
      }
   };

   return (
      <div className="bg-[#2B124C] p-6 text-[#FBE4D8] w-full">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold tracking-wide text-[#FBE4D8]">⚡ Soundclash Live Battle</h3>
            <span className="text-xs bg-[#522B5B] text-[#FBE4D8] px-3 py-1 rounded-full font-medium border border-[#854F6C]">
               {totalVotes} Votes Total
            </span>
         </div>

         <div className="space-y-4">
            {candidates.map((track) => {
               const trackVotes = votes[track._id] || 0;
               const percentage = totalVotes > 0 ? Math.round((trackVotes / totalVotes) * 100) : 0;

               return (
                  <div key={track._id} className="bg-[#190019]/70 p-4 rounded-xl border border-[#522B5B]">
                     <div className="flex justify-between items-center mb-2">
                        <div>
                           <h4 className="font-semibold text-sm text-[#FBE4D8]">{track.title}</h4>
                           <p className="text-xs text-[#DFB6B2]/80">{track.artist}</p>
                        </div>
                        <button
                           onClick={() => handleVote(track._id)}
                           className="bg-[#DFB6B2] hover:bg-[#FBE4D8] text-[#190019] text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                           Vote ({percentage}%)
                        </button>
                     </div>

                     {/* Dynamic Progress Bar */}
                     <div className="w-full bg-[#522B5B]/60 h-2 rounded-full overflow-hidden">
                        <div
                           className="bg-gradient-to-r from-[#854F6C] to-[#DFB6B2] h-full transition-all duration-300 ease-out"
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