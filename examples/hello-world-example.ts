/**
 * Quickstart Example: Midnight Hello World Client SDK
 *
 * How to run:
 *   npx tsx examples/hello-world-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type CircuitContext,
  type ConstructorContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  HelloWorldClient,
  type HelloWorldPrivateState,
  type HelloWorldLedgerState,
} from '../src/client/hello-world-sdk.js';

async function main(): Promise<void> {
  console.log('--- Initializing Hello World Midnight Client SDK ---');

  // 1. Instantiate the high-level client adapter
  const client = new HelloWorldClient();

  // 2. Set up initial mock/test identities (32-byte hex strings)
  const initialPrivateState: HelloWorldPrivateState = {};
  const coinPublicKey = '01'.repeat(32); // 32-byte coin public key hex string
  const contractAddress = '00'.repeat(32); // 32-byte contract address hex string

  // 3. Initialize contract state
  const constructorCtx: ConstructorContext<HelloWorldPrivateState> =
    createConstructorContext(initialPrivateState, coinPublicKey);

  const { currentContractState, currentPrivateState } = client.initialState(constructorCtx);
  console.log('Contract initialized successfully.');

  // 4. Create an execution context for running the circuit
  let circuitCtx: CircuitContext<HelloWorldPrivateState> = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentContractState,
    currentPrivateState
  );

  // 5. Execute storeMessage circuit
  const messageToStore = 'Hello Midnight Network from TypeScript SDK!';
  console.log(`\nExecuting storeMessage("${messageToStore}")...`);

  const executionResult = client.storeMessage(circuitCtx, messageToStore);
  circuitCtx = executionResult.context;

  // 6. Inspect public ledger state
  const ledgerState: HelloWorldLedgerState = client.queryLedgerState(
    circuitCtx.currentQueryContext
  );

  console.log('\n--- Current Ledger State ---');
  console.log(`On-chain message: "${ledgerState.message}"`);
}

main().catch((error) => {
  console.error('Execution failed:', error);
  process.exit(1);
});