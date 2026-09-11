/**
 * blockchainUtils.js
 * Frontend blockchain helper utilities.
 * These mirror the backend blockchain logic for UI verification display.
 */

/**
 * Simple SHA-256 hash using Web Crypto API (browser native)
 * @param {string} data
 * @returns {Promise<string>} hex hash string
 */
export const sha256 = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Compute block hash from its fields.
 * Must match backend blockchainService.js calculateHash logic.
 */
export const computeBlockHash = async (index, timestamp, voteData, previousHash, nonce) => {
  const content = `${index}${timestamp}${JSON.stringify(voteData)}${previousHash}${nonce}`;
  return sha256(content);
};

/**
 * Verify a single block's integrity.
 * @param {Object} block - { index, timestamp, voteData, previousHash, hash, nonce }
 */
export const verifyBlock = async (block) => {
  const computedHash = await computeBlockHash(
    block.index,
    block.timestamp,
    block.voteData,
    block.previousHash,
    block.nonce
  );
  return computedHash === block.hash;
};

/**
 * Verify a chain of blocks.
 * @param {Array} blocks - array of block objects, ordered by index
 * @returns {{ valid: boolean, failedAt: number | null }}
 */
export const verifyChain = async (blocks) => {
  if (!blocks || blocks.length === 0) return { valid: true, failedAt: null };

  for (let i = 1; i < blocks.length; i++) {
    const current = blocks[i];
    const previous = blocks[i - 1];

    // Check hash linkage
    if (current.previousHash !== previous.hash) {
      return { valid: false, failedAt: i };
    }

    // Check current block hash integrity
    const hashValid = await verifyBlock(current);
    if (!hashValid) {
      return { valid: false, failedAt: i };
    }
  }

  return { valid: true, failedAt: null };
};

/**
 * Format a block hash for display (truncated).
 * @param {string} hash
 * @returns {string}
 */
export const formatHash = (hash) => {
  if (!hash) return 'N/A';
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

/**
 * Parse vote data from a block for display.
 */
export const parseVoteFromBlock = (block) => {
  if (!block?.voteData) return null;
  return {
    electionType: block.voteData.electionType,
    tehsil: block.voteData.tehsil,
    province: block.voteData.province,
    timestamp: new Date(block.voteData.timestamp).toLocaleString(),
    hash: formatHash(block.hash),
    index: block.index,
  };
};

/**
 * Get chain validity status label and color.
 */
export const getChainStatus = (isValid) => ({
  label: isValid ? 'Chain Verified ✓' : 'Chain Tampered ✗',
  color: isValid ? '#00c853' : '#d32f2f',
  icon: isValid ? '🔒' : '⚠️',
});