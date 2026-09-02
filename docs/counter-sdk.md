Here is the comprehensive technical documentation and production-grade TypeScript client SDK for the `counter.compact` smart contract.

---

# Part 1: Comprehensive SDK Documentation

## 1. Contract Overview & Architecture

The `Counter` smart contract is an on-chain ledger state machine implemented in Compact (`language_version >= 0.23`). It tracks an incremental numeric counter on the public ledger and exposes zero-knowledge circuits to mutate or reset the counter while enforcing circuit-level constraints.

### 1.1 Public Ledger State Schema
The public ledger state consists of a single 32-bit unsigned integer:

| Field | Compact Type | TypeScript / Runtime Type | Description |
| :--- | :--- | :--- | :--- |
| `count` | `Uint<32>` | `number` (or `bigint` depending on compiler target configuration) | The current accumulated count stored publicly on-chain. |

### 1.2 Private State & Witnesses
- **Witnesses**: None defined in the smart contract source.
- **Private State (`CounterPrivateState`)**: Even with an empty witness set, the Midnight Compact client runtime requires a typed private state container (e.g., `{ readonly dummy?: never }` or custom application metadata) to maintain local wallet/circuit state consistency across transitions.
- **Security Considerations**:
  - The argument `by` passed to `increment(by: Uint<32>)` is private by default in Compact. The circuit explicitly unshields and commits it to the ledger using `disclose(by)`.
  - The constructor initializes `count` to `0` using a literal constant, eliminating private data leakage at deployment.

### 1.3 Zero-Knowledge Circuits & Constraints

| Circuit | Arguments | Return Type | Constraints / Assertions | Description |
| :--- | :--- | :--- | :--- | :--- |
| `constructor()` | None | `[]` | None | Initializes `count = 0`. |
| `increment(by)` | `by: Uint<32>` | `[]` | `assert(by > 0, "Increment step must be greater than zero")` | Validates step > 0, discloses `by`, updates `count = (count + disclose(by)) as Uint<32>`. |
| `reset()` | None | `[]` | None | Resets `count = 0`. |

---

## 2. Prerequisites & Installation

Ensure you have Node.js (>= 18.x) and npm/pnpm/yarn installed.

```bash
npm install @midnight-ntwrk/compact-runtime
npm install -D tsx typescript @types/node
```

Ensure your `tsconfig.json` specifies `"moduleResolution": "NodeNext"` or `"Bundler"` and `"target": "ES2022"`.

---

## 3. API Reference

### `CounterClient<PS = CounterPrivateState>`

```typescript
class CounterClient<PS = CounterPrivateState> {
  constructor(witnesses?: CounterWitnesses<PS>);

  public initialState(
    context: ConstructorContext<PS>
  ): ConstructorResult<PS>;

  public increment(
    context: CircuitContext<PS>,
    by: number
  ): CircuitResults<PS, []>;

  public reset(
    context: CircuitContext<PS>
  ): CircuitResults<PS, []>;

  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): CounterLedgerState;
}
```

### Circuit Error Codes / Assertion Failures
- **`"Increment step must be greater than zero"`**: Thrown if `by <= 0` or if negative values are passed into `increment()`.
- **Arithmetic Overflow**: Passing a value where `count + by > 2^32 - 1` will violate 32-bit unsigned integer bounds during execution.

---

## 4. Step-by-Step Quickstart & Usage Walkthrough

Create the file `examples/counter-example.ts`:

```typescript
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
```

---

## 5. Privacy & Security Notes

1. **Selective Disclosure**:
   In Compact, circuit parameters default to zero-knowledge inputs. The `increment` circuit uses `disclose(by)` because counter step intervals are publicly reflected on the public ledger. If step values must remain confidential, private state accumulators with homomorphic commitments or range proofs must be used instead.
2. **Witness Context Integrity**:
   Off-chain witness functions have access to `WitnessContext<ContractLedger, PS>`. Ensure witness computations do not leak unshielded secrets through side channels or network calls.
3. **Key and Address Hex Encoding**:
   In Midnight.js / Compact runtime environments, contract addresses and public coin keys are represented as 64-character hexadecimal strings (32 bytes). Passing malformed hex strings will lead to cryptographic verification failures during proof synthesis.

---

# Part 2: Production TypeScript Client SDK Implementation

Below is the complete implementation for `src/client/counter-sdk.ts`:

```typescript
/**
 * Production Client SDK for the Midnight Counter Smart Contract.
 *
 * Implements typed circuit invocation, state decoding, and context management
 * adhering strictly to Compact language (>= 0.23) and Midnight.js runtime standards.
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
} from '../../contracts/managed/counter/contract/index.js';

/**
 * Default Private State representation for the Counter contract.
 * Can be extended by consumer applications requiring persistent local storage.
 */
export interface CounterPrivateState {
  readonly [key: string]: unknown;
}

/**
 * Typed Witness interface for the Counter contract.
 * Each witness accepts a WitnessContext and returns a tuple of [nextPrivateState, value].
 */
export type CounterWitnesses<PS = CounterPrivateState> = ContractWitnesses<PS>;

/**
 * Public Ledger State structure for the Counter contract.
 */
export type CounterLedgerState = ContractLedger;

/**
 * Production-ready TypeScript Client SDK for interacting with the Counter contract.
 */
export class CounterClient<PS = CounterPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new instance of CounterClient.
   *
   * @param witnesses - Optional witness implementations. Defaults to an empty object if no witnesses are required.
   */
  constructor(witnesses: CounterWitnesses<PS> = {} as CounterWitnesses<PS>) {
    this.contract = new ManagedContract<PS>(witnesses);
  }

  /**
   * Generates the initial contract state transition via the contract constructor.
   *
   * @param context - The constructor context containing initial private state and deployment keys.
   * @returns ConstructorResult containing the genesis contract state and updated private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `increment` zero-knowledge circuit.
   *
   * @param context - Circuit execution context containing current charged state and private state.
   * @param by - The positive numeric amount by which to increment the on-chain counter.
   * @returns CircuitResults containing execution context updates, query context, and return tuple [].
   */
  public increment(
    context: CircuitContext<PS>,
    by: number
  ): CircuitResults<PS, []> {
    if (by <= 0) {
      throw new Error(
        'Client-side validation error: Increment step must be greater than zero'
      );
    }
    return this.contract.circuits.increment(context, by);
  }

  /**
   * Executes the `reset` zero-knowledge circuit.
   *
   * @param context - Circuit execution context containing current charged state and private state.
   * @returns CircuitResults containing execution context updates, query context, and return tuple [].
   */
  public reset(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.reset(context);
  }

  /**
   * Parses and decodes raw ledger state bytes or query context charged state into typed CounterLedgerState.
   *
   * @param rawState - The raw StateValue or ChargedState obtained from on-chain queries or circuit contexts.
   * @returns Strongly-typed CounterLedgerState (e.g. `{ count: number }`).
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): CounterLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```