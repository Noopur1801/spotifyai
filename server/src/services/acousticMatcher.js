// Validates if a candidate track is a clean segue based on BPM and Camelot Key rules (PRD Section 6.2)
export const validateSegue = (currentTrack, candidateTrack) => {
  const currentBpm = currentTrack.acoustic.bpm;
  const candidateBpm = candidateTrack.acoustic.bpm;

  // 1. BPM Compatibility: within +/- 8% tolerance, or clean half/double time
  const minBpm = currentBpm * 0.92;
  const maxBpm = currentBpm * 1.08;
  const halfTimeBpm = currentBpm * 0.5;
  const doubleTimeBpm = currentBpm * 2.0;

  const isDirectBpmMatch = candidateBpm >= minBpm && candidateBpm <= maxBpm;
  const isHalfTimeMatch = candidateBpm >= (halfTimeBpm * 0.92) && candidateBpm <= (halfTimeBpm * 1.08);
  const isDoubleTimeMatch = candidateBpm >= (doubleTimeBpm * 0.92) && candidateBpm <= (doubleTimeBpm * 1.08);

  if (!isDirectBpmMatch && !isHalfTimeMatch && !isDoubleTimeMatch) {
    return { valid: false, reason: 'BPM mismatch' };
  }

  // 2. Harmonic Key Compatibility (Camelot Wheel simplification)
  const currentKey = currentTrack.acoustic.camelotKey;
  const candidateKey = candidateTrack.acoustic.camelotKey;

  if (isCamelotCompatible(currentKey, candidateKey)) {
    return { valid: true, reason: 'Valid BPM and harmonic key match' };
  }

  return { valid: false, reason: 'Camelot key clash' };
};

const isCamelotCompatible = (key1, key2) => {
  if (key1 === key2) return true; // Identical key

  const num1 = parseInt(key1);
  const letter1 = key1.slice(-1);
  const num2 = parseInt(key2);
  const letter2 = key2.slice(-1);

  // Same letter, adjacent number (+/- 1, wrapping around 12)
  if (letter1 === letter2) {
    const diff = Math.abs(num1 - num2);
    if (diff === 1 || diff === 11) return true;
  }

  // Same number, opposite letter (A <-> B)
  if (num1 === num2 && letter1 !== letter2) {
    return true;
  }

  return false;
};