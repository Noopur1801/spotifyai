import DJLounge from '../models/DJLounge.js';

// Sync in-memory queue cache back to MongoDB database
export const persistQueueToDB = async (loungeId, memoryQueue) => {
  try {
    await DJLounge.findByIdAndUpdate(loungeId, { queue: memoryQueue });
    console.log(`Successfully persisted queue state for lounge: ${loungeId}`);
  } catch (error) {
    console.error(`Failed to persist queue for lounge ${loungeId}:`, error.message);
  }
};