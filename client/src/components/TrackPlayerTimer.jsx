import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const TrackPlayerTimer = ({ loungeId, currentTrack }) => {
   const [socket, setSocket] = useState(null);
   const [timeLeft, setTimeLeft] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);

   // Initialize socket connection
   useEffect(() => {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join_lounge', { loungeId });

      // Listen for track changes broadcasted from the server
      newSocket.on('lounge.track.changed', (data) => {
         console.log('New track loaded via auto-segue:', data.currentTrack.title);
         setTimeLeft(data.currentTrack.durationSeconds || 180);
         setIsPlaying(true);
      });

      return () => newSocket.disconnect();
   }, [loungeId]);

   // Sync timer when currentTrack prop changes
   useEffect(() => {
      if (currentTrack && currentTrack.durationSeconds) {
         setTimeLeft(currentTrack.durationSeconds);
         setIsPlaying(true);
      }
   }, [currentTrack]);

   // Countdown timer effect
   useEffect(() => {
      if (!isPlaying || timeLeft <= 0) return;

      const timer = setInterval(() => {
         setTimeLeft((prev) => {
            if (prev <= 1) {
               clearInterval(timer);
               setIsPlaying(false);

               // Trigger automatic segue event on backend when song ends
               if (socket) {
                  console.log('Track finished. Triggering track.ended event...');
                  socket.emit('track.ended', { loungeId });
               }
               return 0;
            }
            return prev - 1;
         });
      }, 1000);

      return () => clearInterval(timer);
   }, [isPlaying, timeLeft, socket, loungeId]);

   // Format seconds into MM:SS
   const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
   };

   if (!currentTrack) {
      return (
         <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-slate-400 text-center">
            No track currently playing
         </div>
      );
   }

   const progressPercent = ((currentTrack.durationSeconds - timeLeft) / currentTrack.durationSeconds) * 100;

   return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white max-w-md mx-auto shadow-xl">
         <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Now Playing</span>
            <span className="text-xs text-slate-400 font-mono">{formatTime(timeLeft)} remaining</span>
         </div>

         <div className="mb-4">
            <h3 className="text-lg font-bold truncate">{currentTrack.title}</h3>
            <p className="text-sm text-slate-400 truncate">{currentTrack.artist}</p>
         </div>

         {/* Track Progress Bar */}
         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
            <div
               className="bg-indigo-500 h-full transition-all duration-1000 linear"
               style={{ width: `${progressPercent}%` }}
            ></div>
         </div>

         <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>BPM: {currentTrack.acoustic?.bpm}</span>
            <span>Key: {currentTrack.acoustic?.camelotKey}</span>
         </div>
      </div>
   );
};

export default TrackPlayerTimer;