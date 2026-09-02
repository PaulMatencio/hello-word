# Midnight Bulletin Board: Smart Contract & TypeScript SDK Documentation

This document provides technical documentation, architecture specifications, API references, and a production-grade TypeScript client SDK implementation for the **Midnight Bulletin Board** smart contract (`bulletin-board.compact`).

---

## Part 1: Comprehensive SDK Documentation

### 1. Contract Overview & Architecture

The **Bulletin Board** contract is a decentralized, zero-knowledge bulletin board on the Midnight blockchain. It allows users to claim a vacant board, post messages, update their existing post, and take posts down. 

ZK ownership verification ensures that while the owner's verification tag is public, the owner's actual public identity or secret key is never revealed on the public ledger. Each time a post is created or updated, the owner verification tag rotates with the advancing sequence counter to ensure **forward privacy and unlinkability**.

```
                           ┌────────────────────────┐
                           │    Bulletin Board      │
                           │     State Machine      │
                           └───────────┬────────────┘
                                       │
                    constructor()      ▼
                  ┌──────────────────────────────────┐
                  │          State: VACANT           │
                  │  sequence: 1, owner: 0x00...00   │
                  │         message: none()          │
                  └───────────────┬──────────────────┘
                                  │
      postMessage("Hello")        │       takeDown() (Owner)
  [Derives tag via witness sk]    │   [Verifies ownership tag]
                                  ▼
                  ┌──────────────────────────────────┐
                  │         State: OCCUPIED          │
                  │  sequence: 2, owner: tag(sk, 1)  │
                  │       message: some("Hello")     │
                  └───────────────┬──────────────────┘
                                  │
                                  │ postMessage("Updated") (Owner)
                                  │ [Verifies tag(sk, 1), advances seq to 3,
                                  ▼  rotates owner tag to tag(sk, 2)]
```

#### Public Ledger State Schema (`export ledger ...`)

The on-chain public state consists of four fields:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `state` | `State` (`VACANT` or `OCCUPIED`) | Represents the availability status of the board. |
| `message` | `Maybe<Opaque<"string">>` | The currently pinned message, wrapped in `some()` if occupied or `none()` if vacant. |
| `sequence` | `Counter` | Monotonically increasing counter used as an epoch index for owner tag derivation. |
| `owner` | `Bytes<32>` | 32-byte commitment tag derived from the owner's secret key and current sequence number. |

#### Private State & Witness Specification (`witness ...`)

The contract relies on one off-chain witness function:

- **`witness localSecretKey(): Bytes<32>`**: Supplies the caller's 32-byte private secret key to the Zero-Knowledge circuit. The secret key is hashed in-circuit and **never** disclosed directly to the ledger.

#### Available Zero-Knowledge Circuits (`export circuit ...`)

1. **`constructor()`**:
   - Initializes `state` to `State.VACANT`.
   - Initializes `message` to `none<Opaque<"string">>()`.
   - Sets `owner` to 32 zero-bytes (`pad(32, "")`).
   - Increments `sequence` by 1 (initial sequence is 1).

2. **`postMessage(newMessage: Opaque<"string">): []`**:
   - **When VACANT**: Computes tag `H("bboard:pk:", sequence, sk)`, writes tag to `owner` via `disclose()`, sets `message` to `disclose(some(newMessage))`, updates `state` to `OCCUPIED`, and increments `sequence`.
   - **When OCCUPIED**: Asserts that `deriveOwnerTag(sk, sequence - 1) == owner`. Updates `message` to `disclose(some(newMessage))`, rotates `owner` to `disclose(deriveOwnerTag(sk, sequence))`, and increments `sequence`.

3. **`takeDown(): Opaque<"string">`**:
   - Asserts `state == State.OCCUPIED`.
   - Asserts `message.is_some`.
   - Asserts `owner == deriveOwnerTag(sk, sequence - 1)`.
   - Resets `state` to `VACANT`, `message` to `none()`, `owner` to 32 zero-bytes, and increments `sequence`.
   - Returns the previous message string.

---

### 2. Prerequisites & Installation

Ensure you have Node.js 18+ and the required Midnight packages installed:

```bash
npm install @midnight-ntwrk/compact-runtime
npm install -D typescript tsx @types/node
```

---

### 3. API Reference

#### `BulletinBoardClient<PS = BulletinBoardPrivateState>`

```typescript
class BulletinBoardClient<PS = BulletinBoardPrivateState> {
  constructor(witnesses?: BulletinBoardWitnesses<PS>);

  initialState(context: ConstructorContext<PS>): ConstructorResult<PS>;

  postMessage(context: CircuitContext<PS>, newMessage: string): CircuitResults<PS, []>;

  takeDown(context: CircuitContext<PS>): CircuitResults<PS, string>;

  queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): BulletinBoardLedgerState;
}
```

#### Circuit Assertions & Error Codes

| Circuit | Assertion Condition | Error Message |
| :--- | :--- | :--- |
| `postMessage` | `currentTag == computedTag` | `"Only the current owner can edit the post"` |
| `takeDown` | `state == State.OCCUPIED` | `"Attempted to take down post from an empty board"` |
| `takeDown` | `message.is_some` | `"Corrupted state: post is occupied but message is empty"` |
| `takeDown` | `owner == expectedTag` | `"Attempted to take down post, but not the current owner"` |

---

### 4. Step-by-Step Quickstart & Usage Walkthrough

Save the following executable script to `examples/bulletin-board-example.ts`:

```typescript
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
```

---

### 5. Privacy & Security Notes

1. **Tag Rotation & Forward Privacy**: The owner tag is computed as `persistentHash(["bboard:pk:", sequence, sk])`. Because `sequence` increments upon each edit or claim, the public tag changes every time. External observers cannot correlate multiple edits to the same secret key without knowing `sk`.
2. **Off-Chain Witness Management**: The witness `localSecretKey` reads from client-side private memory. Never expose private state to network transport or non-ZK queries.
3. **Explicit Disclosures**: Public ledger mutations require `disclose(...)` in Compact. The SDK ensures data boundaries between off-chain private state and on-chain ledger state remain strictly compartmentalized.

---

## Part 2: Production TypeScript Client SDK Implementation

Below is the complete SDK implementation for `src/client/bulletin-board-sdk.ts`.

```typescript
/**
 * BulletinBoard Client SDK
 *
 * Midnight Compact TypeScript adapter for bulletin-board.compact.
 */

import {
  type CircuitContext,
  type QueryContext,
  type WitnessContext,
  type ConstructorContext,
  type ConstructorResult,
  type CircuitResults,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';

import {
  Contract as ManagedContract,
  ledger,
  type Witnesses as ContractWitnesses,
  type Ledger as ContractLedger,
} from '../../contracts/managed/bulletin-board/contract/index.js';

/**
 * Off-chain private state schema required by the Bulletin Board witness runtime.
 */
export interface BulletinBoardPrivateState {
  readonly secretKey: Uint8Array;
}

/**
 * Strongly typed ledger state representation generated by Compact compiler.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Strongly typed witness interface matching Bulletin Board contract requirements.
 * Witness methods return a tuple [nextPrivateState, witnessReturnValue].
 */
export interface BulletinBoardWitnesses<PS = BulletinBoardPrivateState> {
  localSecretKey: (context: WitnessContext<ContractLedger, PS>) => [PS, Uint8Array];
}

/**
 * Creates default witnesses that extract the secretKey from BulletinBoardPrivateState.
 */
export function createDefaultWitnesses<PS extends BulletinBoardPrivateState>(): BulletinBoardWitnesses<PS> {
  return {
    localSecretKey: (context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] => {
      const { privateState } = context;
      if (!privateState?.secretKey) {
        throw new Error('BulletinBoardWitnesses: Missing secretKey in private state');
      }
      if (privateState.secretKey.length !== 32) {
        throw new Error(
          `BulletinBoardWitnesses: secretKey must be 32 bytes, received ${privateState.secretKey.length} bytes`
        );
      }
      return [privateState, privateState.secretKey];
    },
  };
}

/**
 * Production-grade client SDK for interacting with the Midnight Bulletin Board contract.
 */
export class BulletinBoardClient<PS = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new BulletinBoardClient instance.
   *
   * @param witnesses Optional custom witness implementations. Defaults to standard witness resolvers.
   */
  constructor(witnesses?: BulletinBoardWitnesses<PS>) {
    const activeWitnesses = witnesses ?? (createDefaultWitnesses() as unknown as BulletinBoardWitnesses<PS>);
    this.contract = new ManagedContract<PS>(activeWitnesses as unknown as ContractWitnesses<PS>);
  }

  /**
   * Generates the initial contract and private state for deployment.
   *
   * @param context Constructor context with private state and coin public key.
   * @returns ConstructorResult containing the initial contract state and private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Posts a new message if the board is VACANT, or updates an existing post if caller is owner.
   *
   * @param context Circuit context containing contract address, keys, state, and private state.
   * @param newMessage The text message to post.
   * @returns CircuitResults containing the execution context and unit tuple result `[]`.
   */
  public postMessage(context: CircuitContext<PS>, newMessage: string): CircuitResults<PS, []> {
    return this.contract.circuits.postMessage(context, newMessage);
  }

  /**
   * Takes down an existing post on an OCCUPIED board. Caller must be the current owner.
   *
   * @param context Circuit context containing contract address, keys, state, and private state.
   * @returns CircuitResults containing the execution context and the removed message string.
   */
  public takeDown(context: CircuitContext<PS>): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Decodes and reads the public ledger state from raw or charged contract state.
   *
   * @param rawState Raw ledger state value from query context or charged state.
   * @returns Decoded strongly-typed BulletinBoardLedgerState.
   */
  public queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): BulletinBoardLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```