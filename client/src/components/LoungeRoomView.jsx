import React, { useState, useEffect } from 'react';
import API from '../api/axiosClient.js';

const LoungeRoomView = ({ loungeId }) => {
   const [lounge, setLounge] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchLoungeData = async () => {
         try {
            setLoading(true);
            // Automatically uses baseURL and attaches the JWT token from localStorage!
            const { data } = await API.get(`/lounges/${loungeId}`);
            setLounge(data);
         } catch (err) {
            setError(err.response?.data?.message || err.message);
         } finally {
            setLoading(false);
         }
      };

      if (loungeId) {
         fetchLoungeData();
      }
   }, [loungeId]);

   if (loading) {
      return <div className="text-slate-400 text-center p-6">Loading lounge details...</div>;
   }

   if (error) {
      return (
         <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm max-w-xl mx-auto">
            Error: {error}
         </div>
      );
   }

   return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white max-w-xl mx-auto shadow-xl">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-400">{lounge?.name || 'DJ Lounge'}</h2>
            <span className="text-xs bg-indigo-900 text-indigo-200 px-2.5 py-1 rounded-full font-medium">
               Host: {lounge?.host?.username || 'Unknown'}
            </span>
         </div>

         {/* Active Queue Section */}
         <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
               Active Queue ({lounge?.queue?.length || 0})
            </h3>

            {lounge?.queue && lounge.queue.length > 0 ? (
               <ul className="space-y-2">
                  {lounge.queue.map((track, idx) => (
                     <li key={track._id || idx} className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center border border-slate-700/50">
                        <div>
                           <span className="font-semibold text-sm">{track.title}</span>
                           <span className="text-xs text-slate-400 block">{track.artist}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-mono text-indigo-300 block">{track.acoustic?.bpm} BPM</span>
                           <span className="text-xs font-mono text-slate-400">Key: {track.acoustic?.camelotKey}</span>
                        </div>
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="text-sm text-slate-500 italic bg-slate-800/40 p-4 rounded-lg text-center">
                  Queue is currently empty. Add tracks to get the music flowing!
               </p>
            )}
         </div>
      </div>
   );
};

export default LoungeRoomView;