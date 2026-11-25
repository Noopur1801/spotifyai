import React, { useState, useEffect } from 'react';
import ActiveParticipants from '../components/ActiveParticipants.jsx';
import TrackPlayerTimer from '../components/TrackPlayerTimer.jsx';
import SoundclashCard from '../components/SoundclashCard.jsx';
import API from '../api/axiosClient.js';
import { useSocket } from '../hooks/useSocket.js';

const LoungeDashboard = ({ loungeId }) => {
   const [loungeData, setLoungeData] = useState(null);
   const [loading, setLoading] = useState(true);

   // Pull current user details from localStorage
   const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
   const userId = storedUser.id || 'guest_id';
   const displayName = storedUser.username || 'GuestDJ';

   // Initialize the shared real-time socket connection for this room
   const socket = useSocket(loungeId, userId, displayName);

   useEffect(() => {
      const fetchLounge = async () => {
         try {
            const { data } = await API.get(`/lounges/${loungeId}`);
            setLoungeData(data);
         } catch (err) {
            console.error('Failed to load lounge:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchLounge();
   }, [loungeId]);

   if (loading) {
      return <div className="text-slate-400 text-center p-12">Loading AI DJ Studio...</div>;
   }

   return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
         {/* Top Header Bar */}
         <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
            <div>
               <h1 className="text-2xl font-black tracking-tight text-indigo-400">
                  {loungeData?.name || 'AI DJ Lounge'}
               </h1>
               <p className="text-xs text-slate-400">Real-time collaborative audio session</p>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300">
                  Role: <strong className="text-indigo-400 uppercase">{storedUser.role || 'listener'}</strong>
               </span>
            </div>
         </header>

         {/* Main Grid Layout */}
         <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Sidebar: Active Participants */}
            <div className="lg:col-span-1">
               <ActiveParticipants
                  loungeId={loungeId}
                  userId={userId}
                  displayName={displayName}
               />
            </div>

            {/* Center Area: Player Timer & Soundclash Battle */}
            <div className="lg:col-span-3 space-y-6">
               <TrackPlayerTimer
                  loungeId={loungeId}
                  currentTrack={loungeData?.currentTrackId}
               />

               {loungeData?.settings?.soundclashEnabled && loungeData?.soundclash?.active && (
                  <SoundclashCard
                     loungeId={loungeId}
                     userId={userId}
                     candidates={loungeData.soundclash.candidates}
                  />
               )}
            </div>

         </main>
      </div>
   );
};

export default LoungeDashboard;