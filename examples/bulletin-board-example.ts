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

  //  32-byte private key used to prove ownership of posts for Alice 
  let alicePrivateState: BulletinBoardPrivateState = {
    secretKey: aliceSecretKey,
  };

  //  32-byte private key used to prove ownership of posts for Bob
  const bobPrivateState: BulletinBoardPrivateState = {
    secretKey: bobSecretKey,
  };


  /**
   * client for interact with bulletin board contract
   */
  const client = new BulletinBoardClient<BulletinBoardPrivateState>();
  // 3. Initialize Contract State (Constructor)
  console.log('[1] Initializing Contract...');
  const constructorCtx = createConstructorContext<BulletinBoardPrivateState>(
    alicePrivateState,
    coinPublicKey
  );
  const initResult = client.initialState(constructorCtx);
  let currentChargedState = initResult.currentContractState.data;
  console.log("currentChargedState", currentChargedState)
  alicePrivateState = initResult.currentPrivateState;
  console.log("currentPrivateState", alicePrivateState)
  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Initial State -> state: ${ledgerState.state}, sequence: ${ledgerState.sequence}\n`);



  console.log('[1]  creating circuit context');
  const circuitCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    alicePrivateState
  );

  //   query  ledger state
  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Initial Board State: ${ledgerState.state === 1 ? 'OCCUPIED' : 'VACANT'}`);
  console.log(`Initial Message: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}"`);
  console.log(`Initial Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`);


  // 4. Alice posts a message  
  console.log("[2]Alice posts a message 1:\n");
  let postResult = client.post(circuitCtx, 'Hello Midnight Zero-Knowledge World!');
  currentChargedState = postResult.context.currentQueryContext.state;
  alicePrivateState = postResult.context.currentPrivateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log("After Alice posted a message 1:");
  console.log(`Board State: ${ledgerState.state === 1 ? 'OCCUPIED' : 'VACANT'}`);
  console.log(`Message: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}"`);
  console.log(`Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`);


  try {
    console.log("[3] Alice posts a message 2");
    postResult = client.post(circuitCtx, 'Hello  2  Midnight Zero-Knowledge World! ');
    currentChargedState = postResult.context.currentQueryContext.state;
    alicePrivateState = postResult.context.currentPrivateState;

    ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
    console.log(`Message 2: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}\n"`);
    // console.log(`Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`);
  } catch (err: unknown) {
    console.log(`Expected assertion error caught: ${(err as Error).message}\n`);
  }


  // 5. Bob attempts to post a message
  console.log('[4] Bob attempts to post a message (Should fail)...');
  const unauthorizedCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bobPrivateState
  );

  try {
    postResult = client.post(unauthorizedCtx, 'Hello  3  Midnight Zero-Knowledge World! ');
  } catch (err: unknown) {
    console.log(`Expected assertion error caught: ${(err as Error).message}\n`);
  }


  console.log('[5] Bob attempts unauthorized takedown (Should fail)...');
  try {
    client.takeDown(unauthorizedCtx);
    console.error('Error: Unauthorized takedown succeeded unexpectedly!');
  } catch (err: unknown) {
    console.log(`Expected assertion error caught: ${(err as Error).message}\n`);
    console.log(`Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`)
    console.log(`Message: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}"`);
  }

  // 6. Alice takes down her own post
  console.log('[5] Alice takes down her post...');
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

  if (ledgerState.state === 0) {
    console.log("alice takes down her post successfully")



  }



  console.log('\n=== Demo Completed Successfully ===');
}

runBulletinBoardDemo().catch(console.error);