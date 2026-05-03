const crypto = require('crypto');
const Block = require('../models/Block');

const createHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

const addVoteBlock = async (voteData) => {
  const lastBlock = await Block.findOne().sort({ index: -1 });
  const index = lastBlock ? lastBlock.index + 1 : 0;
  const previousHash = lastBlock ? lastBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = Date.now();
  const hash = createHash({ index, timestamp, voteData, previousHash });

  const block = await Block.create({ index, timestamp, voteData, previousHash, hash });
  return block;
};

const verifyChain = async () => {
  const blocks = await Block.find().sort({ index: 1 });
  if (blocks.length === 0) return true;

  for (let i = 1; i < blocks.length; i++) {
    const current = blocks[i];
    const prev = blocks[i - 1];
    const expectedHash = createHash({
      index: current.index,
      timestamp: current.timestamp,
      voteData: current.voteData,
      previousHash: current.previousHash
    });
    if (current.hash !== expectedHash || current.previousHash !== prev.hash) {
      return false;
    }
  }
  return true;
};

const getChain = async () => {
  return await Block.find().sort({ index: 1 });
};

module.exports = { addVoteBlock, verifyChain, getChain };