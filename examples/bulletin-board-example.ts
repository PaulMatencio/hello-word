/**
 * Quickstart Example: BulletinBoard Client SDK
 *
 * How to run:
 *   npx tsx examples/bulletin-board-example.ts
 */

import {
  CompactRuntime,
  type ConstructorContext,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  BulletinBoardClient,
  type BulletinBoardPrivateState,
  createBulletinBoardWitnesses,
} from '../src/client/bulletin-board-sdk.js';

// Helper function to generate mock 32-byte keys
function mockKey(byteHex: string): Uint8Array {
  return new Uint8Array(32).fill(parseInt(byteHex, 16));
}

async function runExample() {
  console.log('=== Bulletin Board SDK Quickstart Walkthrough ===\n');

  // 1. Setup Identities & Mock Addresses
  const aliceSecretKey = mockKey('0xAA');
  const bobSecretKey = mockKey('0xBB');

  let alicePrivateState: BulletinBoardPrivateState = { secretKey: aliceSecretKey };
  let bobPrivateState: BulletinBoardPrivateState = { secretKey: bobSecretKey };

  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  const client = new BulletinBoardClient<BulletinBoardPrivateState>(createBulletinBoardWitnesses());

  // 2. Initialize Contract State (Constructor)
  console.log('1. Initializing contract state...');
  const constructorCtx: ConstructorContext<BulletinBoardPrivateState> =
    CompactRuntime.createConstructorContext(alicePrivateState, coinPublicKey);

  const initResult = client.initialState(constructorCtx);
  alicePrivateState = initResult.currentPrivateState;
  let currentChargedState = initResult.currentContractState.data;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('-> Initial State:', {
    state: ledgerState.state, // 0 = VACANT
    sequence: ledgerState.sequence,
    message: ledgerState.message.is_some ? ledgerState.message.value : null,
  });

  // 3. Alice Posts First Message to Vacant Board
  console.log('\n2. Alice posts initial message: "Hello, Midnight Network!"');
  let circuitCtx: CircuitContext<BulletinBoardPrivateState> =
    CompactRuntime.createCircuitContext(
      contractAddress,
      coinPublicKey,
      currentChargedState,
      alicePrivateState,
    );

  let postResult = client.postMessage(circuitCtx, 'Hello, Midnight Network!');
  alicePrivateState = postResult.context.currentPrivateState;
  currentChargedState = postResult.context.currentQueryContext.state;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('-> Board State after Alice post:', {
    state: ledgerState.state, // 1 = OCCUPIED
    sequence: ledgerState.sequence,
    message: ledgerState.message.is_some ? ledgerState.message.value : null,
  });

  // 4. Alice Updates Message
  console.log('\n3. Alice updates message: "Midnight Zero-Knowledge Bulletin v2"');
  circuitCtx = CompactRuntime.createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    alicePrivateState,
  );

  let updateResult = client.postMessage(circuitCtx, 'Midnight Zero-Knowledge Bulletin v2');
  alicePrivateState = updateResult.context.currentPrivateState;
  currentChargedState = updateResult.context.currentQueryContext.state;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('-> Board State after Alice update:', {
    state: ledgerState.state,
    sequence: ledgerState.sequence,
    message: ledgerState.message.is_some ? ledgerState.message.value : null,
  });

  // 5. Unauthorized User (Bob) attempts to update the message (Should Fail)
  console.log('\n4. Bob attempts to overwrite Alice\'s post (unauthorized)...');
  try {
    const bobCircuitCtx = CompactRuntime.createCircuitContext(
      contractAddress,
      coinPublicKey,
      currentChargedState,
      bobPrivateState,
    );
    client.postMessage(bobCircuitCtx, 'Bob malicious overwrite');
    console.error('ERROR: Bob should not have been allowed to overwrite!');
  } catch (err: any) {
    console.log('-> Successfully rejected unauthorized update with error:', err.message);
  }

  // 6. Alice Takes Down Her Message
  console.log('\n5. Alice takes down the message...');
  circuitCtx = CompactRuntime.createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    alicePrivateState,
  );

  const takeDownResult = client.takeDown(circuitCtx);
  alicePrivateState = takeDownResult.context.currentPrivateState;
  currentChargedState = takeDownResult.context.currentQueryContext.state;
  const deletedMessage = takeDownResult.result;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('-> Board State after takeDown:', {
    state: ledgerState.state, // 0 = VACANT
    sequence: ledgerState.sequence,
    message: ledgerState.message.is_some ? ledgerState.message.value : null,
    deletedMessageReturned: deletedMessage,
  });

  console.log('\n=== Walkthrough completed successfully ===');
}

runExample().catch(console.error);