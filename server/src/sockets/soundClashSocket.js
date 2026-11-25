import DJLounge from '../models/DJLounge.js';

export const setupSoundclashHandlers = (io, socket) => {
  
  // Handle live vote casting over WebSocket for instant broadcast
  socket.on('soundclash.vote', async ({ loungeId, userId, trackId }) => {
    try {
      const lounge = await DJLounge.findById(loungeId);
      if (!lounge || !lounge.soundclash.active) {
        socket.emit('error', { message: 'No active Soundclash battle found' });
        return;
      }

      // Record or update user vote in the Mongoose Map
      lounge.soundclash.votes.set(userId, trackId);
      await lounge.save();

      // Calculate current vote tallies for each candidate track
      const tallies = {};
      lounge.soundclash.candidates.forEach(id => {
        tallies[id.toString()] = 0;
      });

      for (const votedTrackId of lounge.soundclash.votes.values()) {
        const key = votedTrackId.toString();
        if (tallies[key] !== undefined) {
          tallies[key]++;
        }
      }

      // Broadcast updated vote counts to every participant in the lounge room instantly
      io.to(loungeId).emit('soundclash.vote.update', {
        tallies,
        totalVotes: lounge.soundclash.votes.size,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
};