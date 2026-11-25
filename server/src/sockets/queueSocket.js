import DJLounge from '../models/DJLounge.js';

// In-memory cache for active room queues to prevent DB bottlenecks during heavy voting
const activeQueues = new Map();

const setupQueueHandlers = (io, socket) => {
  
  // User joins a specific lounge room
  socket.on('join_lounge', async ({ loungeId, userId }) => {
    socket.join(loungeId);
    console.log(`User ${userId} joined room ${loungeId}`);

    // Fetch lounge from DB if not already cached in memory
    if (!activeQueues.has(loungeId)) {
      const lounge = await DJLounge.findById(loungeId).populate('queue currentTrackId');
      if (lounge) {
        activeQueues.set(loungeId, lounge.queue);
      }
    }

    // Broadcast presence update to room
    io.to(loungeId).emit('lounge.presence.update', {
      action: 'joined',
      userId,
      timestamp: Date.now()
    });
  });

  // Handle track upvoting / queue reordering
  socket.on('queue.vote', async ({ loungeId, trackId }) => {
    let queue = activeQueues.get(loungeId) || [];

    // Simple reordering logic (e.g., move voted track up or increment priority)
    // For this prototype, let's simulate a reorder event broadcast
    io.to(loungeId).emit('lounge.queue.update', {
      queue,
      reason: 'vote',
      updatedBy: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected from queue gateway: ${socket.id}`);
  });
};

export default setupQueueHandlers;