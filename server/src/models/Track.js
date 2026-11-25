import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  ts: { type: Number, required: true }, // timestamp in seconds
  type: { type: String, enum: ['sample_credit', 'trivia', 'glossary'], required: true },
  text: { type: String, required: true } // popup copy shown at `ts`
});

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: Number, required: true }, // in seconds
  audioAssets: { type: String, required: true }, // audio URL
  acoustic: {
    bpm: { type: Number },
    camelotKey: { type: String }, // e.g., '8A', '8B'
    energy: { type: Number, min: 0, max: 1 },
    valence: { type: Number, min: 0, max: 1 }
  },
  timeline: [timelineEventSchema]
}, { timestamps: true });

trackSchema.index({ 'acoustic.bpm': 1, 'acoustic.camelotKey': 1 });

const Track = mongoose.model('Track', trackSchema);

export default Track;