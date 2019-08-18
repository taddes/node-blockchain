const crypto = require('crypto')

const Transaction = require('./transaction')

class Block {
  constructor(index, previousBlockHash, previousProof, transactions) {
    this.index = index;
    this.proof = previousProof;
    this.previousBlockHash = previousBlockHash;
    this.transactions = transactions;
    this.timestamp = Date.now()
  }
}