/**
 * Quickstart Example: Midnight Bulletin Board Client SDK
 *
 * How to run:
 *   npx tsx examples/bulletin-board-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  BulletinBoardClient,
  type BulletinBoardPrivateState,
} from '../src/client/bulletin-board-sdk.js';

async function runBulletinBoardDemo(): Promise<void> {
  console.log('=== Midnight Bulletin Board SDK Demo ===\n');

  // 1. Setup mock keys & addresses (32-byte hex strings)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // 2. Initialize Alice and Bob private states
  const aliceSecretKey = new Uint8Array(32).fill(7);
  const bobSecretKey = new Uint8Array(32).fill(9);

  let alicePrivateState: BulletinBoardPrivateState = {
    secretKey: aliceSecretKey,
  };

  const bobPrivateState: BulletinBoardPrivateState = {
    secretKey: bobSecretKey,
  };

  const client = new BulletinBoardClient<BulletinBoardPrivateState>();

  // 3. Initialize Contract State (Constructor)
  console.log('[1] Initializing Contract...');
  const constructorCtx = createConstructorContext<BulletinBoardPrivateState>(
    alicePrivateState,
    coinPublicKey
  );

  const initResult = client.initialState(constructorCtx);
  let currentChargedState = initResult.currentContractState.data;
  alicePrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Initial State -> state: ${ledgerState.state}, sequence: ${ledgerState.sequence}\n`);

  // 4. Alice posts a message
  console.log('[2] Alice posts a message: "Hello Midnight Zero-Knowledge World!"');
  const circuitCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    alicePrivateState
  );

  const postResult = client.post(circuitCtx, 'Hello Midnight Zero-Knowledge World!');
  currentChargedState = postResult.context.currentQueryContext.state;
  alicePrivateState = postResult.context.currentPrivateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Board State: ${ledgerState.state === 1 ? 'OCCUPIED' : 'VACANT'}`);
  console.log(`Message: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}"`);
  console.log(`Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`);

  // 5. Bob attempts to take down Alice's post (Expect assertion failure)
  console.log('[3] Bob attempts unauthorized takedown (Should fail)...');
  const unauthorizedCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bobPrivateState
  );

  try {
    client.takeDown(unauthorizedCtx);
    console.error('Error: Unauthorized takedown succeeded unexpectedly!');
  } catch (err: unknown) {
    console.log(`Expected assertion error caught: ${(err as Error).message}\n`);
  }

  // 6. Alice takes down her own post
  console.log('[4] Alice takes down her post...');
  const authorizedCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    alicePrivateState
  );

  const takeDownResult = client.takeDown(authorizedCtx);
  currentChargedState = takeDownResult.context.currentQueryContext.state;
  alicePrivateState = takeDownResult.context.currentPrivateState;

  console.log(`Removed Message Content: "${takeDownResult.result}"`);

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Board State: ${ledgerState.state === 0 ? 'VACANT' : 'OCCUPIED'}`);
  console.log(`Sequence Counter: ${ledgerState.sequence}`);
  console.log(`Current Message: ${ledgerState.message.is_some ? ledgerState.message.value : 'None'}`);

  console.log('\n=== Demo Completed Successfully ===');
}

runBulletinBoardDemo().catch(console.error);