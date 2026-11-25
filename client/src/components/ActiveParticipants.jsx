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
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-white w-64">
         <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Active Room ({participants.length + 1})
         </h4>
         <ul className="space-y-2">
            <li className="text-sm flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               {displayName} (You)
            </li>
            {participants.map((p, idx) => (
               <li key={idx} className="text-sm flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {p.displayName}
               </li>
            ))}
         </ul>
      </div>
   );
};

export default ActiveParticipants;