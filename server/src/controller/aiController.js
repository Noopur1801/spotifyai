// src/controller/aiController.js
import DJLounge from '../models/DJLounge.js';
import Track from '../models/Track.js';
import { validateSegue } from '../services/acousticMatcher.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Request AI DJ next-segue decision and transition script
// @route   POST /api/v1/lounges/:id/ai/segue
// @access  Private (Host/Co-DJ)
export const requestAiSegue = asyncHandler(async (req, res) => {
  const { currentTrackId, currentTs, candidateTrackIds, currentSentimentScore } = req.body;

  // 1. Fetch current track
  const currentTrack = await Track.findById(currentTrackId);
  if (!currentTrack) {
    res.status(404);
    throw new Error('Current track not found');
  }

  // 2. Fetch candidate tracks queued up for review
  const candidates = await Track.find({ _id: { $in: candidateTrackIds } });
  
  let validMatches = [];

  // 3. Filter candidates through our strict acoustic matching rules (BPM & Camelot Key)
  for (const candidate of candidates) {
    const validation = validateSegue(currentTrack, candidate);
    if (validation.valid) {
      validMatches.push({
        track: candidate,
        reason: validation.reason
      });
    }
  }

  if (validMatches.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No rule-valid segues found among candidates.',
      selectedTrackId: null
    });
  }

  // 4. Select the best match (taking the first valid rule-compliant match)
  const chosen = validMatches[0];

  // 5. Generate response payload matching PRD Section 7.3.3
  res.status(200).json({
    success: true,
    selectedTrackId: chosen.track._id,
    matchReason: {
      bpmDeltaPct: Number(((Math.abs(chosen.track.acoustic.bpm - currentTrack.acoustic.bpm) / currentTrack.acoustic.bpm) * 100).toFixed(1)),
      camelotRelation: chosen.track.acoustic.camelotKey === currentTrack.acoustic.camelotKey ? 'identical' : 'compatible',
      energyFit: chosen.track.acoustic.energy
    },
    transitionScript: `Keeping the energy smooth — sliding from ${currentTrack.title} into ${chosen.track.title} on a compatible Camelot key with seamless tempo alignment!`,
    generatedAt: new Date().toISOString()
  });
});