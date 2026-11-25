import DJLounge from '../models/DJLounge.js';
import Track from '../models/Track.js';
import { validateSegue } from './acousticMatcher.js';

export const executeAutoSegue = async (loungeId) => {
  const lounge = await DJLounge.findById(loungeId).populate('queue currentTrackId');
  if (!lounge || lounge.queue.length === 0) {
    return { success: false, message: 'Lounge empty or queue exhausted' };
  }

  const currentTrack = lounge.currentTrackId;
  const candidates = lounge.queue;

  let selectedNextTrack = null;
  let matchDetails = null;

  // Find the first rule-compliant candidate from the queue
  if (currentTrack) {
    for (const candidate of candidates) {
      const validation = validateSegue(currentTrack, candidate);
      if (validation.valid) {
        selectedNextTrack = candidate;
        matchDetails = validation.reason;
        break;
      }
    }
  }

  // Fallback: If no strict acoustic match exists, take the top queue item to keep music playing
  if (!selectedNextTrack) {
    selectedNextTrack = candidates[0];
    matchDetails = 'Fallback: Top queue selection';
  }

  // Shift queue and set new current track
  lounge.queue = lounge.queue.filter(t => t._id.toString() !== selectedNextTrack._id.toString());
  lounge.currentTrackId = selectedNextTrack._id;
  await lounge.save();

  return {
    success: true,
    currentTrack: selectedNextTrack,
    matchReason: matchDetails,
    remainingQueue: lounge.queue
  };
};