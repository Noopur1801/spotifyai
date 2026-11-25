import DJLounge from '../models/DJLounge.js';
import Track from '../models/Track.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Initiate or submit a track to an active Soundclash battle
// @route   POST /api/v1/lounges/:id/soundclash/submit
// @access  Private (Listener / Co-DJ / Host)
const submitSoundclashEntry = asyncHandler(async (req, res) => {
  const { trackId } = req.body;
  const loungeId = req.params.id;

  const lounge = await DJLounge.findById(loungeId);
  if (!lounge) {
    res.status(404);
    throw new Error('DJ Lounge not found');
  }

  if (!lounge.settings.soundclashEnabled) {
    res.status(400);
    throw new Error('Soundclash is disabled for this lounge');
  }

  // Verify track exists
  const track = await Track.findById(trackId);
  if (!track) {
    res.status(404);
    throw new Error('Track not found');
  }

  // Ensure soundclash is active and add candidate if not already present
  if (!lounge.soundclash.active) {
    lounge.soundclash.active = true;
    lounge.soundclash.candidates = [];
    lounge.soundclash.votes = new Map();
  }

  if (lounge.soundclash.candidates.length >= 2) {
    res.status(400);
    throw new Error('Soundclash battle is already at maximum capacity (2 candidates)');
  }

  lounge.soundclash.candidates.push(trackId);
  await lounge.save();

  res.status(200).json({
    success: true,
    message: 'Track successfully entered into the Soundclash battle!',
    soundclash: lounge.soundclash
  });
});

// @desc    Cast a vote for a Soundclash candidate track
// @route   POST /api/v1/lounges/:id/soundclash/vote
// @access  Private (Participant)
const castSoundclashVote = asyncHandler(async (req, res) => {
  const { trackId } = req.body;
  const loungeId = req.params.id;
  const userId = req.user._id.toString();

  const lounge = await DJLounge.findById(loungeId);
  if (!lounge || !lounge.soundclash.active) {
    res.status(400);
    throw new Error('No active Soundclash battle found for this lounge');
  }

  // Record user vote in the Map
  lounge.soundclash.votes.set(userId, trackId);
  await lounge.save();

  res.status(200).json({
    success: true,
    message: 'Vote recorded successfully',
    totalVotes: lounge.soundclash.votes.size
  });
});

export { submitSoundclashEntry, castSoundclashVote };