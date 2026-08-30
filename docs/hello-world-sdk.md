# Deliverable 1: Comprehensive SDK Documentation

---

## 1. Contract Overview & Architecture

The `hello-world.compact` smart contract serves as an introductory state management contract on the Midnight blockchain. It demonstrates how zero-knowledge circuits interact with on-chain public ledger storage and process data disclosure transitions.

```
┌────────────────────────────────────────────────────────┐
│                   Off-Chain (Client)                   │
│                                                        │
│  Private State / Context ──► [ storeMessage(msg) ]     │
│                                      │                 │
│                                      ▼                 │
│                            disclose(newMessage)        │
│                                      │                 │
└──────────────────────────────────────┼─────────────────┘
                                       │ ZK Proof & Public Inputs
                                       ▼
┌────────────────────────────────────────────────────────┐
│                   On-Chain (Ledger)                    │
│                                                        │
│   export ledger message: Opaque<"string">              │
└────────────────────────────────────────────────────────┘
```

### Public Ledger State Schema
The contract defines a single public ledger field:

| Field Name | Compact Type | TypeScript Type | Description |
| :--- | :--- | :--- | :--- |
| `message` | `Opaque<"string">` | `string` | The globally readable text message stored on the Midnight ledger. |

### Private State & Witnesses
The `hello-world` contract does not require off-chain witness lookups or private variables. All computation operates directly on the parameter passed to the circuit. However, the client runtime still provisions an extensible `HelloWorldPrivateState` context to maintain compatibility with Midnight client frameworks.

### Zero-Knowledge Circuits
The contract exports one circuit:

```compact
export circuit storeMessage(newMessage: Opaque<"string">): []
```

- **Logic**: Accepts a string input (`newMessage`), applies `disclose(newMessage)` to acknowledge intentional revelation of off-chain input to the public domain, and assigns the string to the public `message` ledger cell.
- **Constraints / Assertions**: No custom assertions are specified. The circuit will succeed for any valid string input supported by the Compact runtime.

---

## 2. Prerequisites & Installation

To use this SDK, install the Midnight Compact Runtime and cryptographic utility packages:

```bash
npm install @midnight-ntwrk/compact-runtime
npm install -D typescript @types/node
```

Ensure your `tsconfig.json` targets Node 18+ or modern ES runtimes with module resolution set to `NodeNext` or `Bundler`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 3. API Reference

### `HelloWorldClient`

The primary client adapter for interacting with the `hello-world` contract.

#### Constructor
```typescript
new HelloWorldClient(witnesses?: HelloWorldWitnesses<HelloWorldPrivateState>, contract?: ManagedContract<HelloWorldPrivateState>)
```
- `witnesses`: Optional custom off-chain witness implementations.
- `contract`: Optional pre-instantiated contract artifact instance.

#### Methods

##### `initialState(context: ConstructorContext<HelloWorldPrivateState>): ContractInitialState<HelloWorldPrivateState>`
Initializes the contract context and state.
- **Parameters**: `context` - The constructor context containing the initial private state and coin public key.
- **Returns**: `ContractInitialState` object containing initialized private and ledger state buffers.

##### `storeMessage(context: CircuitContext<HelloWorldPrivateState>, newMessage: string): CircuitExecutionResult<HelloWorldPrivateState, void>`
Executes the `storeMessage` zero-knowledge circuit.
- **Parameters**:
  - `context`: Active execution circuit context.
  - `newMessage`: String value to store on-chain.
- **Returns**: Result object containing updated execution context, state transitions, and proof outputs.

##### `queryLedgerState(context: QueryContext): HelloWorldLedgerState`
Extracts and parses typed ledger state from a `QueryContext`.
- **Parameters**: `context`: Context containing the raw state buffer.
- **Returns**: `HelloWorldLedgerState` containing `{ message: string }`.

---

## 4. Step-by-Step Quickstart & Usage Walkthrough

Save this example script to `examples/hello-world-example.ts`:

```typescript
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

  // 2. Set up initial mock/test identities
  const initialPrivateState: HelloWorldPrivateState = {};
  const coinPublicKey = new Uint8Array(32).fill(1); // 32-byte public key representation
  const contractAddress = '00'.repeat(32);           // 32-byte contract address hex

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
```

---

## 5. Privacy & Security Notes

1. **`disclose(...)` Semantics**: The Compact `disclose()` operator strips zero-knowledge shielding from the evaluated expression. Any data passed to `storeMessage` will be visibly broadcast and permanently recorded on the public ledger.
2. **Private State Cleanliness**: Although this contract does not store private ledger fields, client applications should ensure `HelloWorldPrivateState` does not leak sensitive identifiers across sessions if extended with custom witnesses.
3. **Cryptographic Key Handling**: Coin public keys and transaction signing keys should be managed through secure key vaults or hardware wallets when integrating with Midnight network providers.

---

# Deliverable 2: Production TypeScript Client SDK Implementation

```typescript
/**
 * Production-grade TypeScript Client SDK for the Midnight `hello-world` smart contract.
 *
 * Contract: hello-world.compact
 * Language Version: >= 0.23
 */

import {
  type CircuitContext,
  type QueryContext,
  type ConstructorContext,
  type Witnesses,
} from '@midnight-ntwrk/compact-runtime';

import {
  Contract as ManagedContract,
  ledger,
  type Witnesses as ContractWitnesses,
} from '../../contracts/managed/hello-world/contract/index.js';

/**
 * Interface representing the off-chain private state for the Hello World contract.
 */
export interface HelloWorldPrivateState {
  readonly [key: string]: unknown;
}

/**
 * Type mapping for contract witnesses.
 * Witness functions must return a 2-element tuple of [NextPrivateState, ReturnValue].
 */
export type HelloWorldWitnesses<PS = HelloWorldPrivateState> = ContractWitnesses<PS>;

/**
 * Strongly-typed representation of the Hello World on-chain ledger state.
 */
export interface HelloWorldLedgerState {
  /** The public message stored on the ledger */
  readonly message: string;
}

/**
 * Result returned by circuit executions containing updated context and circuit return value.
 */
export interface CircuitExecutionResult<PS, T> {
  /** The resulting circuit context containing updated ledger and private states */
  readonly context: CircuitContext<PS>;
  /** The return value of the circuit execution */
  readonly result: T;
}

/**
 * High-level, production-ready client adapter for interacting with the Hello World smart contract.
 */
export class HelloWorldClient<PS extends HelloWorldPrivateState = HelloWorldPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new instance of the HelloWorldClient.
   *
   * @param witnesses - Optional witness implementations. Uses empty witnesses if omitted.
   * @param contractInstance - Optional pre-instantiated ManagedContract instance.
   */
  constructor(
    witnesses: HelloWorldWitnesses<PS> = {} as HelloWorldWitnesses<PS>,
    contractInstance?: ManagedContract<PS>
  ) {
    this.contract = contractInstance ?? new ManagedContract<PS>(witnesses);
  }

  /**
   * Generates the initial contract state using the provided constructor context.
   *
   * @param context - The constructor initialization context.
   * @returns The initial contract and private state bundle.
   */
  public initialState(
    context: ConstructorContext<PS>
  ): ReturnType<ManagedContract<PS>['initialState']> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `storeMessage` circuit to update the message stored on the ledger.
   *
   * @param context - The active circuit context for execution.
   * @param newMessage - The new string message to disclose and persist on-chain.
   * @returns An execution result containing the updated context.
   * @throws {Error} If the circuit execution or proof generation fails.
   */
  public storeMessage(
    context: CircuitContext<PS>,
    newMessage: string
  ): CircuitExecutionResult<PS, void> {
    if (typeof newMessage !== 'string') {
      throw new TypeError(`Expected newMessage to be a string, received ${typeof newMessage}`);
    }

    const executionResult = this.contract.circuits.storeMessage(context, newMessage);

    return {
      context: executionResult.context,
      result: executionResult.result,
    };
  }

  /**
   * Queries and decodes the typed ledger state from an active QueryContext.
   *
   * @param context - The query context containing current ledger state.
   * @returns Strongly-typed HelloWorldLedgerState.
   */
  public queryLedgerState(context: QueryContext): HelloWorldLedgerState {
    const rawState = context.state.state;
    return this.queryLedgerStateFromRaw(rawState);
  }

  /**
   * Parses raw ledger state buffers into strongly-typed HelloWorldLedgerState.
   *
   * @param rawState - The raw ledger state byte buffer or state object.
   * @returns Strongly-typed HelloWorldLedgerState.
   */
  public queryLedgerStateFromRaw(rawState: unknown): HelloWorldLedgerState {
    const decoded = ledger(rawState);
    return {
      message: decoded.message as string,
    };
  }

  /**
   * Returns the underlying ManagedContract instance.
   */
  public getContract(): ManagedContract<PS> {
    return this.contract;
  }
}
```