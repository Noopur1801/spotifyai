export const setupPresenceHandlers = (io, socket) => {
  // Track user joining room and broadcast presence
  socket.on('presence.join', ({ loungeId, userId, displayName }) => {
    socket.join(loungeId);
    
    // Broadcast to everyone else in the room
    io.to(loungeId).emit('presence.update', {
      event: 'user_joined',
      userId,
      displayName,
      timestamp: Date.now()
    });
  });

  // Handle clean disconnects
  socket.on('disconnect', () => {
    console.log(`Presence socket disconnected: ${socket.id}`);
  });
};