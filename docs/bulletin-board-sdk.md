# Part 1: Comprehensive SDK Documentation

## 1. Contract Overview & Architecture

The `bulletin-board.compact` smart contract provides a decentralized, privacy-preserving bulletin board. Users can post public messages while authenticating their ownership anonymously using a sequence-derived public key generated via Zero-Knowledge (ZK) proofs. 

### Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                               Off-Chain Client                                |
|                                                                               |
|  Private State: { secretKey: Uint8Array (32 bytes) }                          |
|                                                                               |
|  Witness: localSecretKey() ---> [PrivateState, secretKey]                     |
|                                                                               |
|  ZK Circuit Computation:                                                      |
|    post(msg)     ==> Generates ZK proof with disclosed message & owner tag    |
|    takeDown()    ==> Generates ZK proof verifying owner without revealing sk  |
+-------------------------------------------------------------------------------+
                                      |
                                      | Submits ZK Proof + Disclosed State Transitions
                                      v
+-------------------------------------------------------------------------------+
|                            On-Chain Ledger State                              |
|                                                                               |
|  - state: State (VACANT | OCCUPIED)                                           |
|  - message: Maybe<Opaque<"string">>                                           |
|  - sequence: Counter (Increments after every takeDown/creation)               |
|  - owner: Bytes<32> (persistentHash of pad(32, "bboard:pk:"), sequence, sk)   |
+-------------------------------------------------------------------------------+
```

### Public Ledger State Schema

| Field | Compact Type | TypeScript Equivalent | Description |
| :--- | :--- | :--- | :--- |
| `state` | `State` (Enum) | `State` (`VACANT = 0`, `OCCUPIED = 1`) | Tracks whether the board currently holds a message. |
| `message` | `Maybe<Opaque<"string">>` | `string \| null` (or `Maybe<string>`) | The active public message, or empty/none if vacant. |
| `sequence` | `Counter` | `bigint` | Sequence counter incremented upon deployment and removals to prevent replay attacks and generate unlinkable pseudonyms. |
| `owner` | `Bytes<32>` | `Uint8Array` (32 bytes) | The sequence-salted commitment hash of the poster's private key. |

### Private State & Witness Specification

- **Private State Interface**: Contains the off-chain private key (`Uint8Array` of 32 bytes) used to claim ownership over posts.
- **Witness**: `localSecretKey(): Bytes<32>`
  - The off-chain witness returns the private key to the circuit.
  - In Midnight TypeScript SDK runtimes, all witnesses conform to the state-transition signature:
    $$\text{witness}(context: \text{WitnessContext}, \dots\text{args}): [\text{nextPrivateState}, \text{resultValue}]$$
  - The private key is never revealed to the ledger directly. Instead, `owner` is calculated inside the ZK circuit as:
    $$\text{owner} = \text{persistentHash}([\text{pad}(32, \text{"bboard:pk:"}), \text{sequence}, \text{sk}])$$

### Zero-Knowledge Circuits

1. **`post(newMessage: Opaque<"string">): []`**
   - **Preconditions**: `assert(state == State.VACANT, "Attempted to post to an occupied board")`.
   - **Operations**:
     - Computes the dynamic sequence-based public key using `localSecretKey()`.
     - Discloses `owner` and `newMessage`.
     - Sets `state = State.OCCUPIED`.
   - **Returns**: Unit tuple `[]`.

2. **`takeDown(): Opaque<"string">`**
   - **Preconditions**:
     - `assert(state == State.OCCUPIED, "Attempted to take down post from an empty board")`.
     - `assert(owner == publicKey(localSecretKey(), sequence), "Attempted to take down post, but not the current owner")`.
   - **Operations**:
     - Extracts the message.
     - Resets `state = State.VACANT`.
     - Increments `sequence` by 1.
     - Clears `message = none()`.
   - **Returns**: The former message as `string`.

3. **`publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32>`**
   - Pure cryptographic circuit computing the persistent hash commitment.

---

## 2. Prerequisites & Installation

Ensure you have Node.js (>= 18.x) and install the required dependencies:

```bash
npm install @midnight-ntwrk/compact-runtime
```

Ensure your TypeScript configuration (`tsconfig.json`) supports ES modules:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## 3. API Reference

### `BulletinBoardClient<PS extends BulletinBoardPrivateState>`

#### `constructor(witnesses?: BulletinBoardWitnesses<PS>)`
Instantiates the bulletin board SDK client. If witnesses are not passed, default witness implementations resolving `localSecretKey` from private state are provided.

#### `initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`
Executes contract construction locally, returning initial ledger state data, initial private state, and ZSwap states.

#### `post(context: CircuitContext<PS>, message: string): CircuitResults<PS, []>`
Executes the `post` circuit.
- **Parameters**:
  - `context`: Circuit context containing current ledger state and private state.
  - `message`: Text message to post.
- **Throws**: Error if board is already `OCCUPIED`.

#### `takeDown(context: CircuitContext<PS>): CircuitResults<PS, string>`
Executes the `takeDown` circuit.
- **Parameters**:
  - `context`: Circuit context containing current ledger state and private state.
- **Throws**: Error if board is `VACANT` or if private key does not match the post owner.

#### `getPublicKey(context: CircuitContext<PS>, sk: Uint8Array, sequence: Uint8Array): CircuitResults<PS, Uint8Array>`
Executes the `publicKey` pure circuit directly.

#### `queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): BulletinBoardLedgerState`
Decodes raw Midnight ledger state into the strongly typed `ContractLedger` structure.

---

## 4. Step-by-Step Quickstart & Usage Walkthrough

Create `examples/bulletin-board-example.ts`:

```typescript
import {
  createConstructorContext,
  createCircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  BulletinBoardClient,
  type BulletinBoardPrivateState,
} from '../src/client/bulletin-board-sdk.js';

async function runBulletinBoardDemo() {
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

  let bobPrivateState: BulletinBoardPrivateState = {
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
  let currentContractState = initResult.currentContractState;
  alicePrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentContractState.data);
  console.log(`Initial State -> state: ${ledgerState.state}, sequence: ${ledgerState.sequence}\n`);

  // 4. Alice posts a message
  console.log('[2] Alice posts a message: "Hello Midnight Zero-Knowledge World!"');
  let circuitCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentContractState.data,
    alicePrivateState
  );

  const postResult = client.post(circuitCtx, 'Hello Midnight Zero-Knowledge World!');
  currentContractState = {
    ...currentContractState,
    data: postResult.context.currentQueryContext.state.state,
  };
  alicePrivateState = postResult.context.currentPrivateState;

  ledgerState = client.queryLedgerStateFromRaw(currentContractState.data);
  console.log(`Board State: ${ledgerState.state === 1 ? 'OCCUPIED' : 'VACANT'}`);
  console.log(`Message: "${ledgerState.message.is_some ? ledgerState.message.value : 'None'}"`);
  console.log(`Owner Tag: ${Buffer.from(ledgerState.owner).toString('hex')}\n`);

  // 5. Bob attempts to take down Alice's post (Expect assertion failure)
  console.log('[3] Bob attempts unauthorized takedown (Should fail)...');
  const unauthorizedCtx = createCircuitContext<BulletinBoardPrivateState>(
    contractAddress,
    coinPublicKey,
    currentContractState.data,
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
    currentContractState.data,
    alicePrivateState
  );

  const takeDownResult = client.takeDown(authorizedCtx);
  currentContractState = {
    ...currentContractState,
    data: takeDownResult.context.currentQueryContext.state.state,
  };
  alicePrivateState = takeDownResult.context.currentPrivateState;

  console.log(`Removed Message Content: "${takeDownResult.result}"`);

  ledgerState = client.queryLedgerStateFromRaw(currentContractState.data);
  console.log(`Board State: ${ledgerState.state === 0 ? 'VACANT' : 'OCCUPIED'}`);
  console.log(`Sequence Counter: ${ledgerState.sequence}`);
  console.log(`Current Message: ${ledgerState.message.is_some ? ledgerState.message.value : 'None'}`);

  console.log('\n=== Demo Completed Successfully ===');
}

runBulletinBoardDemo().catch(console.error);
```

---

## 5. Privacy & Security Notes

1. **Unlinkable Pseudonyms via Sequence Salting**: The owner identifier is computed as `persistentHash([pad(32, "bboard:pk:"), sequence, sk])`. Because `sequence` increments whenever a post is removed, Alice posting multiple times across different sequence numbers will produce entirely distinct, unlinkable `owner` commitments on the ledger.
2. **Off-Chain Witness Isolation**: The witness `localSecretKey()` supplies `sk` only to the local ZK circuit sandbox. The private key `sk` is never passed to `disclose()`, preventing secret leakage.
3. **Disclose Boundaries**: Only the public message and derived pseudonym hash are disclosed using `disclose(...)`.

---

# Part 2: Production TypeScript Client SDK Implementation

```typescript
/**
 * Bulletin Board Midnight Compact Client SDK
 * File: src/client/bulletin-board-sdk.ts
 *
 * Strongly-typed SDK adapter for the bulletin-board Compact smart contract.
 */

import {
  type CircuitContext,
  type QueryContext,
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
 * Base interface representing the private state required for the Bulletin Board.
 */
export interface BulletinBoardPrivateState {
  /** 32-byte private key used to prove ownership of posts */
  readonly secretKey: Uint8Array;
}

/**
 * Strongly-typed witnesses interface matching Compact witness signatures.
 * Each witness returns a 2-element tuple of [NextPrivateState, ReturnValue].
 */
export interface BulletinBoardWitnesses<PS extends BulletinBoardPrivateState> {
  localSecretKey: (
    context: QueryContext<PS, ContractLedger>
  ) => [PS, Uint8Array];
}

/**
 * Ledger state type alias mapping directly to the contract's public state schema.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Production client SDK for interacting with the Bulletin Board Compact contract.
 */
export class BulletinBoardClient<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes the client with optional witness function overrides.
   *
   * @param witnesses - Optional custom witness implementations.
   */
  constructor(witnesses?: Partial<BulletinBoardWitnesses<PS>>) {
    const defaultWitnesses: ContractWitnesses<PS> = {
      localSecretKey: (
        context: QueryContext<PS, ContractLedger>
      ): [PS, Uint8Array] => {
        const sk = context.currentPrivateState.secretKey;
        if (!sk || sk.length !== 32) {
          throw new Error(
            'Invalid private state: `secretKey` must be a defined Uint8Array of exactly 32 bytes.'
          );
        }
        return [context.currentPrivateState, sk];
      },
      ...witnesses,
    };

    this.contract = new ManagedContract<PS>(defaultWitnesses);
  }

  /**
   * Initializes the contract state using the Compact constructor context.
   *
   * @param context - Constructor execution context.
   * @returns The initial contract, private, and ZSwap states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Posts a new message to the bulletin board.
   * Requires the board to be in the VACANT state.
   *
   * @param context - The current circuit execution context.
   * @param message - The text message to post.
   * @returns Circuit results with empty tuple `[]` return value.
   */
  public post(
    context: CircuitContext<PS>,
    message: string
  ): CircuitResults<PS, []> {
    return this.contract.circuits.post(context, message);
  }

  /**
   * Takes down the current message on the bulletin board.
   * Requires the board to be OCCUPIED and the caller to be the post owner.
   *
   * @param context - The current circuit execution context.
   * @returns Circuit results containing the previous message string.
   */
  public takeDown(
    context: CircuitContext<PS>
  ): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Computes the deterministic owner commitment hash for a given secret key and sequence.
   *
   * @param context - The current circuit execution context.
   * @param sk - 32-byte secret key.
   * @param sequence - 32-byte sequence representation.
   * @returns Circuit results containing the 32-byte public key hash.
   */
  public getPublicKey(
    context: CircuitContext<PS>,
    sk: Uint8Array,
    sequence: Uint8Array
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.publicKey(context, sk, sequence);
  }

  /**
   * Helper utility to decode raw ledger state data into the strongly typed ContractLedger schema.
   *
   * @param rawState - The raw state value or charged state from Midnight runtime.
   * @returns The decoded BulletinBoardLedgerState.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): BulletinBoardLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```