import DJLounge from '../models/DJLounge.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get DJ Lounge details by ID
// @route   GET /api/v1/lounges/:id
// @access  Private
export const getLoungeById = asyncHandler(async (req, res) => {
  const lounge = await DJLounge.findById(req.params.id)
    .populate('hostUserId', 'displayName email role')
    .populate('currentTrackId');

  if (!lounge) {
    res.status(404);
    throw new Error('DJ Lounge not found');
  }

  res.status(200).json({
    success: true,
    data: lounge,
  });
});

// @desc    Create a new DJ Lounge
// @route   POST /api/v1/lounges
// @access  Private (Host/Admin)
export const createLounge = asyncHandler(async (req, res) => {
  const { seedTrackId, vibeProfile, maxParticipants, bpmTolerancePct, soundclashEnabled, aiVerbosity } = req.body;

  // Generate a random 6-character invite code (e.g., SP-9X2L)
  const inviteCode = 'SP-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const lounge = await DJLounge.create({
    hostUserId: req.user._id,
    inviteCode,
    vibeProfile: vibeProfile || 'General Vibe',
    queue: seedTrackId ? [seedTrackId] : [],
    currentTrackId: seedTrackId || null,
    settings: {
      maxParticipants: maxParticipants || 50,
      bpmTolerancePct: bpmTolerancePct || 8,
      soundclashEnabled: soundclashEnabled ?? true,
      aiVerbosity: aiVerbosity || 'normal',
    },
    participantIds: [req.user._id],
  });

  res.status(201).json({
    success: true,
    data: {
      loungeId: lounge._id,
      inviteCode: lounge.inviteCode,
      status: lounge.status,
      hostUserId: lounge.hostUserId,
      createdAt: lounge.createdAt,
    },
  });
});