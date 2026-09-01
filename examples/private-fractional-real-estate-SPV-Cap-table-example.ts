/**
 * Quickstart Example: PrivateFractionalRealEstateSPVCapTable Client SDK
 *
 * How to run:
 *   npx tsx examples/private-fractional-real-estate-SPV-Cap-table-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';
import {
  PrivateFractionalRealEstateSPVCapTableClient,
  type PrivateFractionalRealEstateSPVCapTablePrivateState,
  type PrivateFractionalRealEstateSPVCapTableWitnesses,
} from '../src/client/private-fractional-real-estate-SPV-Cap-table-sdk.js';

// Helper to generate 32-byte Uint8Array buffers
function createBytes32(fillByte: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.fill(fillByte);
  return bytes;
}

// Convert byte arrays to hex strings
function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

async function main(): Promise<void> {
  console.log('=== Private Fractional Real Estate SPV Cap Table Initialization ===\n');

  // 1. Setup Mock Identities & Cryptographic Keys
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  const managerSk = createBytes32(0xaa);
  const managerPk = createBytes32(0xbb); // In production: persistentHash(managerSk)
  const propertyId = createBytes32(0x11); // e.g. Hash of deed / parcel registration
  const authorizedShares = 1_000_000n; // 1 Million Fractional SPV Shares

  const investorAliceSk = createBytes32(0x12);
  const investorAlicePk = createBytes32(0x22);
  const investorBobPk = createBytes32(0x33);

  // 2. Define Private State & Off-chain Witnesses
  const initialPrivateState: PrivateFractionalRealEstateSPVCapTablePrivateState = {
    secretKey: managerSk,
    salts: [createBytes32(0x55), createBytes32(0x66), createBytes32(0x77)],
    knownHoldings: [],
  };

  const witnesses: PrivateFractionalRealEstateSPVCapTableWitnesses<PrivateFractionalRealEstateSPVCapTablePrivateState> = {
    getSenderSecretKey: (context) => {
      return [context.privateState, context.privateState.secretKey];
    },
    getShareHoldingSalt: (context) => {
      const nextSalt = context.privateState.salts[0] || createBytes32(0x99);
      const remainingSalts = context.privateState.salts.slice(1);
      const updatedState = {
        ...context.privateState,
        salts: remainingSalts,
      };
      return [updatedState, nextSalt];
    },
  };

  // 3. Initialize Contract Client and Context
  const client = new PrivateFractionalRealEstateSPVCapTableClient(witnesses);
  const constructorContext = createConstructorContext(initialPrivateState, coinPublicKey);

  console.log('Deploying contract and initializing state...');
  const initResult = client.initialState(constructorContext);

  let currentChargedState: StateValue | ChargedState = initResult.currentContractState.data;
  let currentPrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Property ID: ${toHex(ledgerState.propertyId)}`);
  console.log(`Total Authorized Shares: ${ledgerState.totalAuthorizedShares.toString()}`);
  console.log(`Total Issued Shares: ${ledgerState.totalIssuedShares.toString()}\n`);

  // 4. Issue Shares to Alice
  console.log('--- Step 1: SPV Manager Issues 100,000 Shares to Alice ---');
  const aliceIssueAmount = 100_000n;
  const aliceSalt = createBytes32(0xa1);

  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );

  const issueResult = client.issueShares(
    circuitCtx,
    managerSk,
    investorAlicePk,
    aliceIssueAmount,
    aliceSalt
  );

  currentChargedState = issueResult.context.currentQueryContext.state;
  currentPrivateState = issueResult.context.privateState;

  const aliceCommitment = issueResult.result;
  console.log(`Share Commitment Created: 0x${toHex(aliceCommitment)}`);

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Total Issued Shares on Ledger: ${ledgerState.totalIssuedShares.toString()}`);
  console.log(`Commitments count: ${ledgerState.commitments.size()}`);
  console.log(`Nullifiers count: ${ledgerState.nullifiers.size()}\n`);

  // 5. Alice Transfers 25,000 Shares to Bob (Confidential Transfer)
  console.log('--- Step 2: Alice Privately Transfers 25,000 Shares to Bob ---');
  const transferAmount = 25_000n;
  const bobSalt = createBytes32(0xb1);
  const aliceChangeSalt = createBytes32(0xa2);

  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    {
      ...currentPrivateState,
      secretKey: investorAliceSk,
    }
  );

  const transferResult = client.transferShares(
    circuitCtx,
    investorAliceSk,
    aliceIssueAmount,
    aliceSalt,
    transferAmount,
    investorBobPk,
    bobSalt,
    aliceChangeSalt
  );

  currentChargedState = transferResult.context.currentQueryContext.state;
  currentPrivateState = transferResult.context.privateState;

  console.log(`Bob Commitment:    0x${toHex(transferResult.result.recipientCommitment)}`);
  console.log(`Alice Change UTXO:  0x${toHex(transferResult.result.changeCommitment)}`);

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Commitments count: ${ledgerState.commitments.size()}`);
  console.log(`Nullifiers count:  ${ledgerState.nullifiers.size()} (1 consumed nullifier)\n`);

  // 6. Bob Proves Threshold Ownership (e.g. >= 20,000 shares for Voting)
  console.log('--- Step 3: Bob Proves Shareholding >= 20,000 in Zero-Knowledge ---');
  const thresholdRequirement = 20_000n;

  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );

  const proofResult = client.proveShareThreshold(
    circuitCtx,
    investorBobPk, // ownerSk used to evaluate nullifier/commitment
    transferAmount,
    bobSalt,
    thresholdRequirement
  );

  console.log(`Threshold Proof Verified: ${proofResult.result}`);
  console.log('\n=== Cap Table Lifecycle Simulation Complete ===');
}

main().catch((error) => {
  console.error('Error running SDK example:', error);
  process.exit(1);
});