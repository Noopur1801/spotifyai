import DJLounge from '../models/DJLounge.js';

export const setupSoundclashHandlers = (io, socket) => {
  // Start a soundclash (default duration: 30 seconds)
  socket.on('start_soundclash', async ({ loungeId, candidateTrackIds, durationSec = 30 }) => {
    try {
      const endsAt = new Date(Date.now() + durationSec * 1000);

      const lounge = await DJLounge.findByIdAndUpdate(
        loungeId,
        {
          'soundclash.endsAt': endsAt,
          'soundclash.candidates': candidateTrackIds || [],
          'soundclash.votes': {},
        },
        { new: true }
      );

      if (!lounge) {
        return socket.emit('soundclash_error', { message: 'Lounge not found' });
      }

      io.to(loungeId).emit('soundclash_started', {
        loungeId,
        soundclash: lounge.soundclash,
      });
    } catch (err) {
      socket.emit('soundclash_error', { message: err.message });
    }
  });

  // Cast a vote while endsAt is still in the future
  socket.on('cast_vote', async ({ loungeId, userId, trackId }) => {
    try {
      const lounge = await DJLounge.findById(loungeId);
      const isActive = lounge?.soundclash?.endsAt && new Date(lounge.soundclash.endsAt) > new Date();

      if (!isActive) {
        return socket.emit('soundclash_error', { message: 'No active soundclash' });
      }

      lounge.soundclash.votes.set(String(userId || socket.id), String(trackId));
      await lounge.save();

      io.to(loungeId).emit('vote_updated', {
        loungeId,
        votes: Object.fromEntries(lounge.soundclash.votes),
        candidates: lounge.soundclash.candidates,
        endsAt: lounge.soundclash.endsAt,
      });
    } catch (err) {
      socket.emit('soundclash_error', { message: err.message });
    }
  });
};