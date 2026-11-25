import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveParticipants from '../components/ActiveParticipants.jsx';
import TrackPlayerTimer from '../components/TrackPlayerTimer.jsx';
import SoundclashCard from '../components/SoundclashCard.jsx';
import API from '../api/axiosClient.js';
import { useSocket } from '../hooks/useSocket.js';

const LoungeDashboard = ({ loungeId }) => {
   const [loungeData, setLoungeData] = useState(null);
   const [loading, setLoading] = useState(true);

   // Create Lounge modal state
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [loungeVibes, setLoungeVibes] = useState('');
   const [creating, setCreating] = useState(false);
   const [createError, setCreateError] = useState('');

   const navigate = useNavigate();

   // Pull current user details from localStorage
   const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
   const userId = storedUser.id || 'guest_id';
   const displayName = storedUser.username || 'GuestDJ';

   // Initialize the shared real-time socket connection for this room
   const socket = useSocket(loungeId, userId, displayName);

   const handleLogout = () => {
      if (socket) socket.disconnect();
      localStorage.removeItem('user');
      navigate('/auth', { replace: true });
   };

   const handleCreateLounge = async (e) => {
      e.preventDefault();
      if (!loungeVibes.trim()) return;

      setCreating(true);
      setCreateError('');
      try {
         const { data } = await API.post('/lounges', {
            hostId: storedUser.id || null,
            loungeVibes: loungeVibes.trim(),
         });

         const newLoungeId = data?.data?.loungeId || data?.loungeId;
         setShowCreateModal(false);
         setLoungeVibes('');

         if (newLoungeId) {
            navigate(`/lounge/${newLoungeId}`);
         }
      } catch (err) {
         setCreateError(err.response?.data?.message || 'Failed to create lounge');
      } finally {
         setCreating(false);
      }
   };

   useEffect(() => {
      const fetchLounge = async () => {
         setLoading(true);
         try {
            const { data } = await API.get(`/lounges/${loungeId}`);
            setLoungeData(data.data || data);
         } catch (err) {
            console.error('Failed to load lounge:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchLounge();
   }, [loungeId]);

   if (loading) {
      return (
         <div className="min-h-screen bg-[#190019] text-[#DFB6B2] flex items-center justify-center font-medium">
            Loading AI DJ Studio...
         </div>
      );
   }

   const isSoundclashActive =
      loungeData?.soundclash?.endsAt &&
      new Date(loungeData.soundclash.endsAt) > new Date();

   return (
      <div className="min-h-screen bg-[#190019] text-[#FBE4D8] p-6 md:p-8">
         {/* Top Header Bar */}
         <header className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-[#522B5B]/70 pb-5">
            <div>
               <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#DFB6B2] animate-pulse" />
                  <h1 className="text-3xl font-black tracking-tight text-[#FBE4D8]">
                     {loungeData?.loungeVibes || 'AI DJ Lounge'}
                  </h1>
               </div>
               <p className="text-sm text-[#DFB6B2]/80 mt-1 font-medium">
                  Real-time collaborative audio session
                  {loungeData?.inviteCode && (
                     <span className="ml-3 inline-block bg-[#2B124C] text-[#FBE4D8] px-2.5 py-0.5 rounded-md font-mono text-xs border border-[#854F6C]">
                        CODE: {loungeData.inviteCode}
                     </span>
                  )}
               </p>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs bg-[#854F6C] hover:bg-[#522B5B] text-[#FBE4D8] px-4 py-2 rounded-xl font-bold tracking-wide transition shadow-sm cursor-pointer border border-[#DFB6B2]/30"
               >
                  + Create Lounge
               </button>

               <span className="text-xs bg-[#2B124C] border border-[#522B5B] px-3.5 py-2 rounded-xl text-[#DFB6B2] font-medium">
                  Role:{' '}
                  <strong className="text-[#FBE4D8] uppercase tracking-wider">
                     {storedUser.role || 'listener'}
                  </strong>
               </span>

               <button
                  onClick={handleLogout}
                  className="text-xs bg-[#DFB6B2] hover:bg-[#FBE4D8] text-[#190019] px-4 py-2 rounded-xl font-bold tracking-wide transition shadow-sm cursor-pointer"
               >
                  Logout
               </button>
            </div>
         </header>

         {/* Main Grid Layout */}
         <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar: Active Participants */}
            <div className="lg:col-span-1 w-full rounded-2xl overflow-hidden border border-[#522B5B]/70 bg-[#2B124C]/60">
               <ActiveParticipants
                  loungeId={loungeId}
                  userId={userId}
                  displayName={displayName}
               />
            </div>

            {/* Center Area: Player Timer & Soundclash Battle */}
            <div className="lg:col-span-3 w-full space-y-6">
               <div className="w-full rounded-2xl overflow-hidden border border-[#522B5B]/70 bg-[#2B124C]/60">
                  <TrackPlayerTimer
                     loungeId={loungeId}
                     currentTrack={loungeData?.currentTrackId}
                  />
               </div>

               {loungeData?.settings?.soundclashEnabled && isSoundclashActive && (
                  <div className="w-full rounded-2xl overflow-hidden border border-[#854F6C] bg-[#2B124C]/80">
                     <SoundclashCard
                        loungeId={loungeId}
                        userId={userId}
                        candidates={loungeData.soundclash.candidates}
                     />
                  </div>
               )}
            </div>
         </main>

         {/* Create Lounge Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
               <div className="w-full max-w-md bg-[#2B124C] border border-[#854F6C] rounded-2xl p-6 shadow-2xl text-[#FBE4D8]">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Create a New Lounge</h2>
                     <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-[#DFB6B2] hover:text-[#FBE4D8] text-lg cursor-pointer"
                     >
                        ✕
                     </button>
                  </div>

                  {createError && (
                     <div className="mb-4 text-xs bg-red-500/20 border border-red-400/50 text-red-200 p-2.5 rounded-lg">
                        {createError}
                     </div>
                  )}

                  <form onSubmit={handleCreateLounge} className="space-y-4">
                     <div>
                        <label className="block text-xs uppercase tracking-wider text-[#DFB6B2] mb-1.5 font-semibold">
                           Lounge Vibe / Name
                        </label>
                        <input
                           type="text"
                           value={loungeVibes}
                           onChange={(e) => setLoungeVibes(e.target.value)}
                           placeholder="e.g. Late Night Lo-Fi, High-Energy EDM"
                           required
                           className="w-full bg-[#190019] border border-[#522B5B] rounded-xl px-4 py-2.5 text-[#FBE4D8] placeholder-[#854F6C] focus:outline-none focus:border-[#DFB6B2]"
                        />
                     </div>

                     <div className="flex justify-end gap-2 pt-2">
                        <button
                           type="button"
                           onClick={() => setShowCreateModal(false)}
                           className="text-xs px-4 py-2 rounded-xl border border-[#522B5B] text-[#DFB6B2] hover:bg-[#522B5B]/40 cursor-pointer"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={creating}
                           className="text-xs px-5 py-2 rounded-xl bg-[#DFB6B2] hover:bg-[#FBE4D8] text-[#190019] font-bold transition cursor-pointer disabled:opacity-50"
                        >
                           {creating ? 'Creating...' : 'Launch Lounge'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default LoungeDashboard;