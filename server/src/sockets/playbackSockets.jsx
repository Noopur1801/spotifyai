import { executeAutoSegue } from '../services/autoSegueService.js';

export const setupPlaybackHandlers = (io, socket) => {
   socket.on('track.ended', async ({ loungeId }) => {
      try {
         const result = await executeAutoSegue(loungeId);

         if (result.success) {
            // Broadcast new track and updated queue to all participants in the room
            io.to(loungeId).emit('lounge.track.changed', {
               currentTrack: result.currentTrack,
               matchReason: result.matchReason,
               remainingQueue: result.remainingQueue,
               timestamp: Date.now()
            });
         } else {
            io.to(loungeId).emit('lounge.queue.empty', {
               message: 'Queue is empty. Add more tracks to keep the vibe alive!'
            });
         }
      } catch (error) {
         socket.emit('error', { message: error.message });
      }
   });
};