import mongoose from 'mongoose';

const djLoungeSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inviteCode: { type: String, required: true, unique: true, length: 6 }, // 6-char hex
  loungeVibes: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },

  queue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  currentTrackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', default: null },
  currentTrackTime: { type: Number, default: 0 }, // playback position in seconds

  soundclash: {
    endsAt: { type: Date, default: null }, // active only when endsAt > Date.now()
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    votes: { type: Map, of: String, default: {} }
  },

  settings: {
    maxParticipants: { type: Number, default: 50 },
    aiVerbosity: { type: String, default: 'normal' },
    bpmTolerancePct: { type: Number, default: 8 },
    soundclashEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

const DJLounge = mongoose.model('DJLounge', djLoungeSchema);

export default DJLounge;