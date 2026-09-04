/**
 * Quickstart Example: FungibleToken Client SDK
 *
 * How to run:
 *   npx tsx examples/FungibleToken-example.ts
 */

import {
  CompactRuntime,
  type CircuitContext,
  type ConstructorContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  FungibleTokenClient,
  type FungibleTokenPrivateState,
} from '../src/client/FungibleToken-sdk.js';

// Helper to construct 32-byte Uint8Array address buffers
function createAddress(byteValue: number): Uint8Array {
  const buf = new Uint8Array(32);
  buf.fill(byteValue);
  return buf;
}

async function main(): Promise<void> {
  console.log('=== Midnight FungibleToken SDK Demo ===\n');

  // 1. Setup mock keys (32-byte hex strings for contract and coin public keys)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  const alice = createAddress(0xaa);
  const bob = createAddress(0xbb);
  const minter = createAddress(0x11);

  // 2. Initialize private state and instantiate client
  const initialPrivateState: FungibleTokenPrivateState = {
    localAccountKey: alice,
  };
  const client = new FungibleTokenClient<FungibleTokenPrivateState>();

  // 3. Initialize contract on-chain state
  const constructorCtx: ConstructorContext<FungibleTokenPrivateState> =
    CompactRuntime.createConstructorContext(initialPrivateState, coinPublicKey);

  const initResult = client.initialState(constructorCtx);
  let currentChargedState = initResult.currentContractState.data;
  let currentPrivateState = initResult.currentPrivateState;

  console.log('Contract constructor executed successfully.');

  // Helper closure for generating circuit contexts
  const makeCircuitContext = (): CircuitContext<FungibleTokenPrivateState> =>
    CompactRuntime.createCircuitContext(
      contractAddress,
      coinPublicKey,
      currentChargedState,
      currentPrivateState,
    );

  // 4. Initialize token metadata
  console.log('Initializing token parameters (Midnight Dollar, MIDD, 6)...');
  const initCircuitResult = client.initialize(
    makeCircuitContext(),
    'Midnight Dollar',
    'MIDD',
    6n,
  );
  currentChargedState = initCircuitResult.context.currentQueryContext.state;
  currentPrivateState = initCircuitResult.context.privateState;

  // 5. Mint tokens to Alice
  const mintAmount = 1_000_000_000n; // 1,000 tokens (6 decimals)
  console.log(`Minting ${mintAmount} units to Alice...`);
  const mintResult = client.mint(makeCircuitContext(), alice, mintAmount);
  currentChargedState = mintResult.context.currentQueryContext.state;
  currentPrivateState = mintResult.context.privateState;

  // 6. Transfer tokens from Alice to Bob
  const transferAmount = 250_000_000n;
  console.log(`Transferring ${transferAmount} units from Alice to Bob...`);
  const transferResult = client.transfer(
    makeCircuitContext(),
    alice,
    bob,
    transferAmount,
  );
  currentChargedState = transferResult.context.currentQueryContext.state;
  currentPrivateState = transferResult.context.privateState;

  // 7. Query updated balances via circuits
  const aliceBalanceResult = client.balanceOf(makeCircuitContext(), alice);
  const bobBalanceResult = client.balanceOf(makeCircuitContext(), bob);

  console.log('\n--- State Verification ---');
  console.log(`Alice Balance: ${aliceBalanceResult.result.toString()}`);
  console.log(`Bob Balance:   ${bobBalanceResult.result.toString()}`);

  // 8. Query typed ledger snapshot
  const parsedLedger = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Total Supply:  ${parsedLedger._totalSupply.toString()}`);
  console.log(`Token Name:    ${parsedLedger._name}`);
  console.log(`Token Symbol:  ${parsedLedger._symbol}`);
  console.log('========================================');
}

main().catch((err) => {
  console.error('Error running FungibleToken SDK Demo:', err);
  process.exit(1);
});