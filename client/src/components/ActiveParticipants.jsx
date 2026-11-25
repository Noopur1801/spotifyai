import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ActiveParticipants = ({ loungeId, userId, displayName }) => {
   const [participants, setParticipants] = useState([]);

   useEffect(() => {
      const socket = io('http://localhost:5000');

      socket.emit('presence.join', { loungeId, userId, displayName });

      socket.on('presence.update', (data) => {
         if (data.event === 'user_joined') {
            setParticipants((prev) => [...prev.filter(p => p.userId !== data.userId), data]);
         }
      });

      return () => socket.disconnect();
   }, [loungeId, userId, displayName]);

   return (
      <div className="bg-[#2B124C] p-5 text-[#FBE4D8] w-full">
         <h4 className="text-xs font-semibold uppercase tracking-wider text-[#DFB6B2] mb-3">
            Active Room ({participants.length + 1})
         </h4>
         <ul className="space-y-2.5">
            <li className="text-sm flex items-center gap-2.5 font-medium text-[#FBE4D8]">
               <span className="w-2 h-2 bg-[#DFB6B2] rounded-full animate-pulse"></span>
               {displayName} (You)
            </li>
            {participants.map((p, idx) => (
               <li key={idx} className="text-sm flex items-center gap-2.5 text-[#DFB6B2]/80">
                  <span className="w-2 h-2 bg-[#854F6C] rounded-full"></span>
                  {p.displayName}
               </li>
            ))}
         </ul>
      </div>
   );
};

export default ActiveParticipants;