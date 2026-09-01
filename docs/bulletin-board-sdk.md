# Technical Documentation & Client SDK: Bulletin Board Contract

---

## Part 1: Comprehensive SDK Documentation

### 1. Contract Overview & Architecture

The `BulletinBoard` contract implements a decentralized, privacy-preserving bulletin board on the Midnight blockchain. It allows users to claim a vacant board, post messages, update messages if they are the current owner, and take down active posts while maintaining forward unlinkability and zero-knowledge ownership verification.

#### Public Ledger State Schema (`export ledger ...`)

The public on-chain state stored on the ledger is represented by `ContractLedger`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `state` | `State` (`VACANT = 0`, `OCCUPIED = 1`) | Tracks whether the bulletin board is open or occupied. |
| `message` | `Maybe<string>` (`{ is_some: boolean, value?: string }`) | The current posted message (or `none` when vacant). |
| `sequence` | `Counter` (`bigint`) | Monotonically increasing sequence number ensuring anti-replay and unlinkability across updates. |
| `owner` | `Uint8Array` (`Bytes<32>`) | Zero-knowledge commitment/tag computed as `persistentHash(["bboard:pk:", sequence, sk])`. |

#### Private State & Witness Specification

| Witness | Signature | Description |
| :--- | :--- | :--- |
| `localSecretKey` | `(): Bytes<32>` | Supplies the caller's private 32-byte secret key off-chain. Returns `[PS, Uint8Array]` where `PS` is the client private state. |

**Security Architecture:**
- **Zero-Knowledge Ownership:** The caller proves ownership by proving in ZK that they possess the preimage `sk` corresponding to the commitment stored in `owner` at the expected sequence number `sequence - 1`. The raw secret key `sk` is never published to the ledger.
- **Unlinkable Forward Privacy:** Every message update rotates the sequence number and publishes a freshly derived owner tag calculated with the incremented sequence, preventing external observers from linking sequential message updates to the same identity.

#### Zero-Knowledge Circuits

##### 1. `postMessage(newMessage: string): []`
- **VACANT State:** Computes the commitment `tag = deriveOwnerTag(sk, sequence)`, stores `owner = tag`, sets `message = some(newMessage)`, advances `state = State.OCCUPIED`, and increments `sequence`.
- **OCCUPIED State:** Verifies caller ownership via `assert(owner == deriveOwnerTag(sk, sequence - 1))`, updates `message = some(newMessage)`, generates a new `owner = deriveOwnerTag(sk, sequence)`, and increments `sequence`.
- **Assertions:**
  - `"Only the current owner can edit the post"` (if the board is occupied and `deriveOwnerTag` mismatch occurs).

##### 2. `takeDown(): string`
- Takes down an existing post. Only callable by the current owner.
- Resets `state` to `VACANT`, clears `message` to `none`, resets `owner` to 32 zero bytes, and increments `sequence`.
- Returns the previous message string.
- **Assertions:**
  - `"Attempted to take down post from an empty board"` (if `state != State.OCCUPIED`).
  - `"Corrupted state: post is occupied but message is empty"` (if `message.is_some == false`).
  - `"Attempted to take down post, but not the current owner"` (if caller's tag does not match `owner`).

---

### 2. Prerequisites & Installation

Add the required Midnight Compact runtime packages:

```bash
npm install @midnight-ntwrk/compact-runtime
npm install -D typescript @types/node tsx
```

Ensure your `tsconfig.json` targets Node 18+ with `ESNext` module resolution.

---

### 3. API Reference

#### `BulletinBoardClient<PS>`

```typescript
class BulletinBoardClient<PS extends BulletinBoardPrivateState> {
  constructor(witnesses?: BulletinBoardWitnesses<PS>);

  initialState(
    constructorCtx: ConstructorContext<PS>
  ): ConstructorResult<PS>;

  postMessage(
    circuitCtx: CircuitContext<BulletinBoardLedgerState, PS>,
    newMessage: string
  ): CircuitResults<PS, []>;

  takeDown(
    circuitCtx: CircuitContext<BulletinBoardLedgerState, PS>
  ): CircuitResults<PS, string>;

  queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): BulletinBoardLedgerState;
}
```

---

### 4. Step-by-Step Quickstart & Usage Walkthrough

Save this executable script to `examples/bulletin-board-example.ts`.

```typescript
/**
 * Quickstart Example: BulletinBoard Client SDK
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
  type BulletinBoardWitnesses,
} from '../src/client/bulletin-board-sdk.js';

// Setup Mock 32-Byte Hex Keys and Addresses
const coinPublicKey = '01'.repeat(32);
const contractAddress = '00'.repeat(32);

// Setup Private States for Two Users
const userA_SecretKey = new Uint8Array(32).fill(7);
const userB_SecretKey = new Uint8Array(32).fill(9);

const userAPrivateState: BulletinBoardPrivateState = {
  secretKey: userA_SecretKey,
};

const userBPrivateState: BulletinBoardPrivateState = {
  secretKey: userB_SecretKey,
};

// Define Standard Witnesses
const witnesses: BulletinBoardWitnesses<BulletinBoardPrivateState> = {
  localSecretKey: (context) => {
    return [context.privateState, context.privateState.secretKey];
  },
};

async function main() {
  console.log('=== Initializing Bulletin Board SDK Client ===');
  const client = new BulletinBoardClient<BulletinBoardPrivateState>(witnesses);

  // 1. Initialize Contract State
  const constructorCtx = createConstructorContext(userAPrivateState, coinPublicKey);
  const initResult = client.initialState(constructorCtx);

  let currentChargedState = initResult.currentContractState.data;
  let currentUserAPrivateState = initResult.currentPrivateState;

  let ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Initial Ledger State:', {
    state: ledgerView.state === 0 ? 'VACANT' : 'OCCUPIED',
    sequence: ledgerView.sequence,
  });

  // 2. User A Posts a Message
  console.log('\n--- User A posts "Hello Midnight World!" ---');
  const postCtx1 = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentUserAPrivateState,
  );

  const postResult1 = client.postMessage(postCtx1, 'Hello Midnight World!');
  currentChargedState = postResult1.context.currentQueryContext.state;
  currentUserAPrivateState = postResult1.context.privateState;

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Updated Ledger State:', {
    state: ledgerView.state === 1 ? 'OCCUPIED' : 'VACANT',
    message: ledgerView.message.is_some ? ledgerView.message.value : null,
    sequence: ledgerView.sequence,
  });

  // 3. User A Updates the Message
  console.log('\n--- User A updates message to "Midnight Privacy in Action" ---');
  const postCtx2 = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentUserAPrivateState,
  );

  const postResult2 = client.postMessage(postCtx2, 'Midnight Privacy in Action');
  currentChargedState = postResult2.context.currentQueryContext.state;
  currentUserAPrivateState = postResult2.context.privateState;

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Updated Ledger State:', {
    state: ledgerView.state === 1 ? 'OCCUPIED' : 'VACANT',
    message: ledgerView.message.is_some ? ledgerView.message.value : null,
    sequence: ledgerView.sequence,
  });

  // 4. User B attempts unauthorized take down (Should Fail)
  console.log('\n--- User B attempts unauthorized take down (Expected failure) ---');
  const unauthCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    userBPrivateState,
  );

  try {
    client.takeDown(unauthCtx);
    console.error('ERROR: Unauthorized take down succeeded unexpectedly.');
  } catch (err: any) {
    console.log('Successfully rejected unauthorized takeDown:', err.message || err);
  }

  // 5. User A Takes Down the Post
  console.log('\n--- User A takes down the post ---');
  const takeDownCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentUserAPrivateState,
  );

  const takeDownResult = client.takeDown(takeDownCtx);
  currentChargedState = takeDownResult.context.currentQueryContext.state;
  currentUserAPrivateState = takeDownResult.context.privateState;

  console.log('Former message returned by circuit:', takeDownResult.result);

  ledgerView = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Final Ledger State:', {
    state: ledgerView.state === 0 ? 'VACANT' : 'OCCUPIED',
    message: ledgerView.message.is_some ? ledgerView.message.value : null,
    sequence: ledgerView.sequence,
  });
}

main().catch(console.error);
```

---

### 5. Privacy & Security Notes

1. **Private State Storage:** Keep `BulletinBoardPrivateState.secretKey` securely stored within secure client keyrings/hardware enclaves. Never pass private keys to loggers or public network calls.
2. **Witness Purity:** The `localSecretKey` witness must return a tuple `[PS, Uint8Array]` without side effects or unencrypted network telemetry.
3. **Disclose Scope:** The contract uses `disclose()` exclusively on deterministic hashes (`owner`) and the public payload (`message`), preserving preimage confidentiality for all actors.

---

## Part 2: Production TypeScript Client SDK Implementation

```typescript
/**
 * Production Client SDK for the Midnight Bulletin Board Smart Contract.
 *
 * Provides typed execution context wrappers, witness management,
 * and ledger query decoders.
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
 * Off-chain private state managed locally by the client.
 */
export interface BulletinBoardPrivateState {
  readonly secretKey: Uint8Array;
}

/**
 * Public ledger state mapping.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Strongly typed witness definitions matching Compact witness declarations.
 */
export type BulletinBoardWitnesses<PS extends BulletinBoardPrivateState> = {
  readonly localSecretKey: (
    context: WitnessContext<ContractLedger, PS>
  ) => [PS, Uint8Array];
};

/**
 * Production-grade Client SDK for the BulletinBoard Midnight contract.
 */
export class BulletinBoardClient<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs a new BulletinBoardClient.
   *
   * @param witnesses - Optional custom witness implementations. Defaults to reading `secretKey` from private state.
   */
  constructor(witnesses?: Partial<BulletinBoardWitnesses<PS>>) {
    const defaultWitnesses: BulletinBoardWitnesses<PS> = {
      localSecretKey: (context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] => {
        return [context.privateState, context.privateState.secretKey];
      },
    };

    const resolvedWitnesses: ContractWitnesses<PS> = {
      localSecretKey: (witnessContext: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] => {
        if (witnesses?.localSecretKey) {
          return witnesses.localSecretKey(witnessContext);
        }
        return defaultWitnesses.localSecretKey(witnessContext);
      },
    };

    this.contract = new ManagedContract<PS>(resolvedWitnesses);
  }

  /**
   * Initializes the contract state via the constructor context.
   *
   * @param context - The constructor context containing initial private state and coin public key.
   * @returns ConstructorResult containing initial contract and private states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `postMessage` circuit.
   * Claims the board if VACANT, or updates the post if called by the current owner.
   *
   * @param context - Active circuit context.
   * @param newMessage - The message payload to post.
   * @returns Circuit execution results containing updated context and empty unit tuple return `[]`.
   */
  public postMessage(
    context: CircuitContext<BulletinBoardLedgerState, PS>,
    newMessage: string
  ): CircuitResults<PS, []> {
    return this.contract.circuits.postMessage(context, newMessage);
  }

  /**
   * Executes the `takeDown` circuit.
   * Clears the board and returns it to VACANT state.
   *
   * @param context - Active circuit context.
   * @returns Circuit execution results containing updated context and the removed message string.
   */
  public takeDown(
    context: CircuitContext<BulletinBoardLedgerState, PS>
  ): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Decodes and reads raw on-chain state into strongly typed `BulletinBoardLedgerState`.
   *
   * @param rawState - Raw state value or charged state received from node query.
   * @returns Typed contract ledger state.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): BulletinBoardLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```