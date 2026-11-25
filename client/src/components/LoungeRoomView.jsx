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
            const { data } = await API.get(`/lounges/${loungeId}`);
            setLounge(data.data || data);
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
      return <div className="text-[#DFB6B2] text-center p-6">Loading lounge details...</div>;
   }

   if (error) {
      return (
         <div className="bg-red-500/10 border border-red-400/50 text-red-200 p-4 rounded-xl text-sm w-full">
            Error: {error}
         </div>
      );
   }

   return (
      <div className="bg-[#2B124C] border border-[#522B5B] rounded-2xl p-6 text-[#FBE4D8] w-full shadow-xl">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#FBE4D8]">{lounge?.loungeVibes || 'DJ Lounge'}</h2>
            <span className="text-xs bg-[#522B5B] text-[#DFB6B2] px-3 py-1 rounded-full font-medium">
               Host: {lounge?.hostId?.username || 'Unknown'}
            </span>
         </div>

         {/* Active Queue Section */}
         <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#DFB6B2] mb-3">
               Active Queue ({lounge?.queue?.length || 0})
            </h3>

            {lounge?.queue && lounge.queue.length > 0 ? (
               <ul className="space-y-2">
                  {lounge.queue.map((track, idx) => (
                     <li key={track._id || idx} className="bg-[#190019]/70 p-3 rounded-xl flex justify-between items-center border border-[#522B5B]">
                        <div>
                           <span className="font-semibold text-sm text-[#FBE4D8]">{track.title}</span>
                           <span className="text-xs text-[#DFB6B2]/80 block">{track.artist}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-mono text-[#DFB6B2] block">{track.acoustic?.bpm} BPM</span>
                           <span className="text-xs font-mono text-[#854F6C]">Key: {track.acoustic?.camelotKey}</span>
                        </div>
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="text-sm text-[#DFB6B2]/70 italic bg-[#190019]/50 p-4 rounded-xl text-center border border-[#522B5B]/50">
                  Queue is currently empty. Add tracks to get the music flowing!
               </p>
            )}
         </div>
      </div>
   );
};

export default LoungeRoomView;