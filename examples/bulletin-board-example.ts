/**
 * Quickstart Example: BulletinBoard Client SDK
 *
 * How to run:
 *   npx tsx examples/bulletin-board-example.ts
 */

import { CompactRuntime } from '@midnight-ntwrk/compact-runtime';
import {
  BulletinBoardClient,
  type BulletinBoardPrivateState,
  createDefaultWitnesses,
} from '../src/client/bulletin-board-sdk.js';

async function main() {
  console.log('=== Midnight Bulletin Board SDK Walkthrough ===\n');

  // 1. Setup mock keys and contract addresses (32-byte hex strings)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // User Alice's private key (32 bytes)
  const aliceSecretKey = new Uint8Array(32).fill(0xaa);
  const alicePrivateState: BulletinBoardPrivateState = { secretKey: aliceSecretKey };

  // User Bob's private key (32 bytes)
  const bobSecretKey = new Uint8Array(32).fill(0xbb);
  const bobPrivateState: BulletinBoardPrivateState = { secretKey: bobSecretKey };

  // Instantiate client SDK
  const client = new BulletinBoardClient(createDefaultWitnesses());

  // 2. Initialize contract state
  console.log('1. Initializing Bulletin Board contract...');
  const constructorCtx = CompactRuntime.createConstructorContext(alicePrivateState, coinPublicKey);
  const initResult = client.initialState(constructorCtx);

  // Track ledger state data
  let currentChargedState = initResult.currentContractState.data;
  let aliceState = initResult.currentPrivateState;

  let ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('   Initial Board State:', ledgerView.state === 0 ? 'VACANT' : 'OCCUPIED');
  console.log('   Initial Sequence:', ledgerView.sequence.value);

  // 3. Alice posts a message to the vacant board
  console.log('\n2. Alice claims the vacant board and posts a message...');
  const postCtx1 = CompactRuntime.createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    aliceState
  );

  const postResult1 = client.postMessage(postCtx1, 'Hello Midnight World from Alice!');
  currentChargedState = postResult1.context.currentQueryContext.state;
  aliceState = postResult1.context.privateState;

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('   Board State:', ledgerView.state === 1 ? 'OCCUPIED' : 'VACANT');
  console.log('   Message:', ledgerView.message.is_some ? ledgerView.message.value : 'none');
  console.log('   Sequence:', ledgerView.sequence.value);

  // 4. Alice updates her message
  console.log('\n3. Alice edits her existing post...');
  const postCtx2 = CompactRuntime.createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    aliceState
  );

  const postResult2 = client.postMessage(postCtx2, 'Alice updated her message with zk-privacy!');
  currentChargedState = postResult2.context.currentQueryContext.state;
  aliceState = postResult2.context.privateState;

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('   Updated Message:', ledgerView.message.is_some ? ledgerView.message.value : 'none');
  console.log('   Sequence:', ledgerView.sequence.value);

  // 5. Bob attempts to overwrite Alice's post (expect circuit assertion failure)
  console.log('\n4. Bob attempts to edit Alice\'s post (should fail)...');
  try {
    const bobCtx = CompactRuntime.createCircuitContext(
      contractAddress,
      coinPublicKey,
      currentChargedState,
      bobPrivateState
    );
    client.postMessage(bobCtx, 'Bob malicious edit');
    console.error('   ERROR: Bob was able to overwrite Alice\'s post!');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('   Expected circuit failure caught:', message);
  }

  // 6. Alice takes down her post
  console.log('\n5. Alice takes down her post...');
  const takeDownCtx = CompactRuntime.createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    aliceState
  );

  const takeDownResult = client.takeDown(takeDownCtx);
  currentChargedState = takeDownResult.context.currentQueryContext.state;
  aliceState = takeDownResult.context.privateState;

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('   Returned Taken Down Message:', takeDownResult.result);
  console.log('   Final Board State:', ledgerView.state === 0 ? 'VACANT' : 'OCCUPIED');
  console.log('   Final Sequence:', ledgerView.sequence.value);
  console.log('\n=== Walkthrough completed successfully ===');
}

main().catch(console.error);