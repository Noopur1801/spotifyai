import crypto from 'crypto';
import DJLounge from '../models/DJLounge.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get DJ Lounge details by ID
// @route   GET /api/v1/lounges/:id
export const getLoungeById = asyncHandler(async (req, res) => {
  const lounge = await DJLounge.findById(req.params.id)
    .populate('hostId', 'username email role')
    .populate('currentTrackId');

  if (!lounge) {
    return res.status(404).json({ success: false, message: 'DJ Lounge not found' });
  }

  res.status(200).json({
    success: true,
    data: lounge,
  });
});

// @desc    Create a new DJ Lounge
// @route   POST /api/v1/lounges
export const createLounge = asyncHandler(async (req, res) => {
  const {
    hostId,
    seedTrackId,
    loungeVibes,
    maxParticipants,
    bpmTolerancePct,
    soundclashEnabled,
    aiVerbosity,
  } = req.body;

  const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  const lounge = await DJLounge.create({
    hostId: hostId || null,
    inviteCode,
    loungeVibes: loungeVibes || 'General Vibe',
    queue: seedTrackId ? [seedTrackId] : [],
    currentTrackId: seedTrackId || null,
    currentTrackTime: 0,
    settings: {
      maxParticipants: maxParticipants || 50,
      bpmTolerancePct: bpmTolerancePct || 8,
      soundclashEnabled: soundclashEnabled ?? true,
      aiVerbosity: aiVerbosity || 'normal',
    },
  });

  res.status(201).json({
    success: true,
    data: {
      loungeId: lounge._id,
      inviteCode: lounge.inviteCode,
      loungeVibes: lounge.loungeVibes,
      status: lounge.status,
      hostId: lounge.hostId,
      createdAt: lounge.createdAt,
    },
  });
});