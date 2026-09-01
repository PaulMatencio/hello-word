/**
 * Quickstart Example: ConfidentialSealedBidRealestateAuctions Client SDK
 *
 * How to run:
 *   npx tsx examples/confidential-sealed-bid-realestate-auctions-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';
import {
  ConfidentialSealedBidRealestateAuctionsClient,
  AuctionState,
  type ConfidentialSealedBidRealestateAuctionsPrivateState,
  type BidCommitment,
} from '../src/client/confidential-sealed-bid-realestate-auctions-sdk.js';

// Helper for 32-byte hex arrays
function createBytes32(fillByte: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.fill(fillByte);
  return bytes;
}

async function runAuctionSimulation() {
  console.log('=== Starting Real Estate Sealed-Bid Auction Simulation ===\n');

  // 1. Setup Mock Identities and Addresses
  const sellerPk = createBytes32(0xaa);
  const propertyId = createBytes32(0x99);
  const reservePrice = 500_000n; // $500,000 reserve

  const bidderPk = createBytes32(0x01);
  const bidderBidAmount = 750_000n; // $750,000 bid
  const bidderSalt = createBytes32(0x77);

  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // 2. Setup Private State & Witness Providers
  let bidderPrivateState: ConfidentialSealedBidRealestateAuctionsPrivateState = {
    bidCommitment: {
      bidderPk,
      bidAmount: bidderBidAmount,
      salt: bidderSalt,
    },
  };

  const client = new ConfidentialSealedBidRealestateAuctionsClient({
    getBidDetails: (context) => {
      if (!context.privateState.bidCommitment) {
        throw new Error('No private bid details found in private state');
      }
      return [context.privateState, context.privateState.bidCommitment];
    },
  });

  // 3. Initialize Contract
  console.log('Deploying contract and setting initial state...');
  const constructorCtx = createConstructorContext(
    bidderPrivateState,
    coinPublicKey
  );
  const initResult = client.initialState(constructorCtx);

  let currentChargedState: StateValue | ChargedState =
    initResult.currentContractState.data;
  bidderPrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Initial Auction State:', {
    minReservePrice: ledgerState.minReservePrice.toString(),
    state: AuctionState[ledgerState.state],
    highestBid: ledgerState.highestBid.toString(),
  });

  // 4. Bidder Submits Sealed Bid Commitment
  console.log('\nSubmitting sealed bid commitment...');
  // Mock commitment: In production, hash matches persistentHash<BidCommitment>(bid)
  const mockCommitment = createBytes32(0x55);

  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const submitBidResult = client.submitBid(
    circuitCtx,
    bidderPk,
    mockCommitment
  );
  currentChargedState = submitBidResult.context.currentQueryContext.state;
  bidderPrivateState = submitBidResult.context.privateState;
  console.log('Bid commitment successfully registered.');

  // 5. Seller Closes Bidding Phase
  console.log('\nClosing bidding phase...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const closeBiddingResult = client.closeBidding(circuitCtx);
  currentChargedState = closeBiddingResult.context.currentQueryContext.state;
  bidderPrivateState = closeBiddingResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Current Auction State:', AuctionState[ledgerState.state]);

  // 6. Seller Finalizes Auction
  console.log('\nFinalizing auction...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const finalizeResult = client.finalizeAuction(circuitCtx);
  currentChargedState = finalizeResult.context.currentQueryContext.state;
  bidderPrivateState = finalizeResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Final Auction State:', AuctionState[ledgerState.state]);
  console.log('Winning Bidder:', Buffer.from(ledgerState.winningBidder).toString('hex'));
  console.log('Highest Bid:', ledgerState.highestBid.toString());

  console.log('\n=== Simulation Completed Successfully ===');
}

runAuctionSimulation().catch(console.error);