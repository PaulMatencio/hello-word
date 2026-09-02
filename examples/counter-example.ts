/**
 * Quickstart Example: Counter Client SDK
 *
 * How to run:
 *   npx tsx examples/counter-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  CounterClient,
  type CounterPrivateState,
} from '../src/client/counter-sdk.js';

async function main() {
  console.log('--- Initializing Midnight Counter SDK Walkthrough ---');

  // 1. Instantiate the SDK adapter
  const client = new CounterClient<CounterPrivateState>();

  // 2. Setup mock keys and addresses (32-byte hex strings)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);
  let privateState: CounterPrivateState = {};

  // 3. Initialize Contract State via Constructor
  const constructorCtx = createConstructorContext(privateState, coinPublicKey);
  const initResult = client.initialState(constructorCtx);

  // Update tracking pointers
  privateState = initResult.currentPrivateState;
  let currentChargedState = initResult.currentContractState.data;

  // Query and print initial state
  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`[Genesis] Initial Counter on Ledger: ${ledgerState.count}`);

  // 4. Execute increment circuit (by: 5)
  console.log('\n-> Invoking increment(5)...');
  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );

  let result = client.increment(circuitCtx, 5);

  // Update local state and on-chain charged state pointer from query context
  privateState = result.context.currentPrivateState;
  currentChargedState = result.context.currentQueryContext.state;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`[After increment(5)] Counter on Ledger: ${ledgerState.count}`);

  // 5. Execute increment circuit again (by: 10)
  console.log('\n-> Invoking increment(10)...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );

  result = client.increment(circuitCtx, 10);
  privateState = result.context.currentPrivateState;
  currentChargedState = result.context.currentQueryContext.state;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`[After increment(10)] Counter on Ledger: ${ledgerState.count}`);

  // 6. Execute reset circuit
  console.log('\n-> Invoking reset()...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );

  result = client.reset(circuitCtx);
  privateState = result.context.currentPrivateState;
  currentChargedState = result.context.currentQueryContext.state;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`[After reset()] Counter on Ledger: ${ledgerState.count}`);

  console.log('\n--- Walkthrough completed successfully ---');
}

main().catch((error) => {
  console.error('Execution error:', error);
  process.exit(1);
});