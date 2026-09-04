# Part 1: Comprehensive SDK Documentation

## 1. Contract Overview & Architecture

The **FungibleToken** contract implements a standard ERC-20-style fungible token on the Midnight blockchain using the Compact language (version $\ge$ 0.23). The contract manages token metadata (name, symbol, decimals), total supply, per-account balances, and third-party spending allowances within Midnight's hybrid execution and zero-knowledge privacy model.

```
+-----------------------------------------------------------------------------+
|                          FungibleToken Architecture                         |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |                         Public Ledger State                           |  |
|  |  • _isInitialized: Boolean                                            |  |
|  |  • _name: Opaque<"string">                                            |  |
|  |  • _symbol: Opaque<"string">                                          |  |
|  |  • _decimals: Uint<8>                                                 |  |
|  |  • _totalSupply: Uint<128>                                            |  |
|  |  • _balances: Map<Bytes<32>, Uint<128>>                               |  |
|  |  • _allowances: Map<Bytes<32>, Map<Bytes<32>, Uint<128>>>             |  |
|  +-----------------------------------------------------------------------+  |
|                                     ^                                       |
|                                     | (disclose)                            |
|  +-----------------------------------------------------------------------+  |
|  |                        Zero-Knowledge Circuits                        |  |
|  |  • initialize(name, symbol, decimals)                                 |  |
|  |  • transfer(caller, to, value) -> Boolean                             |  |
|  |  • approve(caller, spender, value) -> Boolean                         |  |
|  |  • transferFrom(caller, fromAccount, to, value) -> Boolean            |  |
|  |  • _mint(account, value) / _burn(account, value)                      |  |
|  |  • name(), symbol(), decimals(), totalSupply()                        |  |
|  |  • balanceOf(account), allowance(owner, spender)                     |  |
|  +-----------------------------------------------------------------------+  |
|                                     ^                                       |
|                                     | (witness context / off-chain state)   |
|  +-----------------------------------------------------------------------+  |
|  |                        Client Private State                           |  |
|  |  • Local caller identities (signing keys / public keys)               |  |
|  |  • Cached token metadata & transaction records                        |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

### Public Ledger State Schema

| State Field | Compact Type | TypeScript / SDK Type | Description |
| :--- | :--- | :--- | :--- |
| `_isInitialized` | `Boolean` | `boolean` | Flag indicating if token initialization occurred. |
| `_name` | `Opaque<"string">` | `string` | Human-readable token name (e.g., "Midnight Dollar"). |
| `_symbol` | `Opaque<"string">` | `string` | Ticker symbol (e.g., "MIDD"). |
| `_decimals` | `Uint<8>` | `bigint` / `number` | Decimal precision (typically 6 or 18). |
| `_totalSupply` | `Uint<128>` | `bigint` | Total units currently minted in circulation. |
| `_balances` | `Map<Bytes<32>, Uint<128>>` | Custom Map accessor | Mapping from account address (`Bytes<32>`) to balance (`Uint<128>`). |
| `_allowances` | `Map<Bytes<32>, Map<Bytes<32>, Uint<128>>>` | Nested Map accessor | Nested mapping from owner $\rightarrow$ spender $\rightarrow$ approved amount. |

### Private State & Witness Specification

Because all parameters passed to circuits are private by default in Compact, explicit calls to `disclose(...)` ensure selective transparency when mutating the public ledger. The `FungibleToken` contract operates without requiring off-chain witness oracle callbacks, maintaining deterministic execution across prover contexts while allowing client SDK private state (`FungibleTokenPrivateState`) to retain local signing keys or accounting metadata.

### Available Circuits & Constraints

- `initialize(name_: Opaque<"string">, symbol_: Opaque<"string">, decimals_: Uint<8>): []`
  - **Constraint**: `assert(!_isInitialized, "FungibleToken: contract already initialized")`
  - Sets token identity and marks the contract as initialized.
- `transfer(caller: Bytes<32>, to: Bytes<32>, value: Uint<128>): Boolean`
  - **Constraints**: Sender cannot be zero; Receiver cannot be zero; Sender must have `balance >= value`.
- `approve(caller: Bytes<32>, spender: Bytes<32>, value: Uint<128>): Boolean`
  - **Constraints**: Owner and spender cannot be zero. Sets `_allowances[caller][spender] = value`.
- `transferFrom(caller: Bytes<32>, fromAccount: Bytes<32>, to: Bytes<32>, value: Uint<128>): Boolean`
  - **Constraints**: Allowance must be sufficient. Deducts from allowance (unless `MAX_UINT128`) and transfers funds.
- `_mint(account: Bytes<32>, value: Uint<128>): []`
  - **Constraints**: Receiver cannot be zero; Total supply must not overflow `MAX_UINT128`.
- `_burn(account: Bytes<32>, value: Uint<128>): []`
  - **Constraints**: Sender cannot be zero; Sender balance must be $\ge$ `value`.
- `balanceOf(account: Bytes<32>): Uint<128>` / `allowance(owner: Bytes<32>, spender: Bytes<32>): Uint<128>`
  - Non-mutating state accessors returning on-chain balances and allowances.

---

## 2. Prerequisites & Installation

To install dependencies for building and running the TypeScript SDK:

```bash
# Save as scripts/FungibleToken-install.sh
#!/usr/bin/env bash
set -euo pipefail

echo "Installing Midnight Compact Runtime and TypeScript dependencies..."
npm install --save \
  @midnight-ntwrk/compact-runtime@^0.7.0 \
  @midnight-ntwrk/compact-js@^0.7.0

npm install --save-dev \
  typescript@^5.5.0 \
  tsx@^4.19.0 \
  @types/node@^20.0.0

echo "Dependencies successfully installed."
```

---

## 3. API Reference

### `FungibleTokenClient<PS>`

```typescript
class FungibleTokenClient<PS extends FungibleTokenPrivateState = FungibleTokenPrivateState>
```

#### Constructor
- `new FungibleTokenClient(witnesses?: FungibleTokenWitnesses<PS>)`
  Instantiates the SDK client binding witness handlers to contract circuits.

#### Core Methods

- `initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`
  Executes the contract constructor and returns the initial ledger and charged state data.

- `initialize(context: CircuitContext<PS>, name: string, symbol: string, decimals: bigint | number): CircuitResults<PS, []>`
  Initializes token metadata.

- `transfer(context: CircuitContext<PS>, caller: Uint8Array, to: Uint8Array, value: bigint): CircuitResults<PS, boolean>`
  Transfers `value` tokens from `caller` to `to`. Returns `true` on success.

- `approve(context: CircuitContext<PS>, caller: Uint8Array, spender: Uint8Array, value: bigint): CircuitResults<PS, boolean>`
  Authorizes `spender` to withdraw tokens up to `value` from `caller`.

- `transferFrom(context: CircuitContext<PS>, caller: Uint8Array, fromAccount: Uint8Array, to: Uint8Array, value: bigint): CircuitResults<PS, boolean>`
  Spends allowance to execute a transfer on behalf of `fromAccount`.

- `mint(context: CircuitContext<PS>, account: Uint8Array, value: bigint): CircuitResults<PS, []>`
  Mints `value` tokens to `account`.

- `burn(context: CircuitContext<PS>, account: Uint8Array, value: bigint): CircuitResults<PS, []>`
  Burns `value` tokens from `account`.

- `balanceOf(context: CircuitContext<PS>, account: Uint8Array): CircuitResults<PS, bigint>`
  Fetches the balance for `account`.

- `allowance(context: CircuitContext<PS>, owner: Uint8Array, spender: Uint8Array): CircuitResults<PS, bigint>`
  Queries the approved spending limit.

- `queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): FungibleTokenLedgerState`
  Parses raw ledger data into a typed `FungibleTokenLedgerState` instance.

---

## 4. Step-by-Step Quickstart & Usage Walkthrough

Save the following file as `examples/FungibleToken-example.ts`:

```typescript
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
```

---

## 5. Privacy & Security Notes

1. **Selective Ledger Disclosure**: In Compact $\ge$ 0.23, circuit inputs are private witness inputs by default. Modifying public balances or state requires explicit `disclose(...)` expressions.
2. **Account Key Privacy**: The addresses in `_balances` and `_allowances` are stored as public `Bytes<32>` identifiers on ledger state. If privacy of identity is required, use shielded commitments (`persistentHash`) and private nullifiers instead of raw public key digests.
3. **Integer Arithmetic Bounds**: All balance computations in the Compact contract are explicitly cast to `Uint<128>`, ensuring protection against overflow/underflow via assertions.

---

# Part 2: Production TypeScript Client SDK Implementation

Save the following file as `src/client/FungibleToken-sdk.ts`:

```typescript
// SPDX-License-Identifier: MIT
/**
 * @file FungibleToken-sdk.ts
 * Production-grade TypeScript Client SDK for the Midnight FungibleToken Compact smart contract.
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
} from '../../contracts/managed/FungibleToken/contract/index.js';

/**
 * Client-side private state interface for FungibleToken operations.
 */
export interface FungibleTokenPrivateState {
  /** Optional off-chain signing key or identity identifier */
  readonly localAccountKey?: Uint8Array;
  /** Custom extensible off-chain metadata */
  readonly [key: string]: unknown;
}

/**
 * Witness context type mapping for the FungibleToken contract.
 */
export type FungibleTokenWitnessContext<PS extends FungibleTokenPrivateState> = WitnessContext<
  ContractLedger,
  PS
>;

/**
 * Strongly-typed witness implementations for FungibleToken.
 */
export interface FungibleTokenWitnesses<PS extends FungibleTokenPrivateState = FungibleTokenPrivateState>
  extends ContractWitnesses<PS> {}

/**
 * Typed on-chain ledger state representation.
 */
export type FungibleTokenLedgerState = ContractLedger;

/**
 * High-level client SDK for interacting with the Midnight FungibleToken smart contract.
 */
export class FungibleTokenClient<PS extends FungibleTokenPrivateState = FungibleTokenPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new instance of the FungibleTokenClient.
   * @param witnesses Optional witness implementations.
   */
  public constructor(witnesses: FungibleTokenWitnesses<PS> = {} as FungibleTokenWitnesses<PS>) {
    this.contract = new ManagedContract<PS>(witnesses);
  }

  /**
   * Builds the initial contract state using the provided constructor context.
   * @param context Constructor context containing initial private state and coin public key.
   * @returns ConstructorResult containing the initial contract state and private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Initializes token metadata and parameters.
   * @param context Circuit execution context.
   * @param name Human-readable token name.
   * @param symbol Token ticker symbol.
   * @param decimals Decimal precision.
   */
  public initialize(
    context: CircuitContext<PS>,
    name: string,
    symbol: string,
    decimals: bigint | number,
  ): CircuitResults<PS, []> {
    return this.contract.circuits.initialize(context, name, symbol, BigInt(decimals));
  }

  /**
   * Retrieves the token name from ledger state.
   * @param context Circuit execution context.
   */
  public name(context: CircuitContext<PS>): CircuitResults<PS, string> {
    return this.contract.circuits.name(context);
  }

  /**
   * Retrieves the token symbol from ledger state.
   * @param context Circuit execution context.
   */
  public symbol(context: CircuitContext<PS>): CircuitResults<PS, string> {
    return this.contract.circuits.symbol(context);
  }

  /**
   * Retrieves the token decimal precision from ledger state.
   * @param context Circuit execution context.
   */
  public decimals(context: CircuitContext<PS>): CircuitResults<PS, bigint> {
    return this.contract.circuits.decimals(context);
  }

  /**
   * Retrieves the total circulating token supply.
   * @param context Circuit execution context.
   */
  public totalSupply(context: CircuitContext<PS>): CircuitResults<PS, bigint> {
    return this.contract.circuits.totalSupply(context);
  }

  /**
   * Queries the token balance for a specified 32-byte account address.
   * @param context Circuit execution context.
   * @param account 32-byte account address.
   */
  public balanceOf(context: CircuitContext<PS>, account: Uint8Array): CircuitResults<PS, bigint> {
    return this.contract.circuits.balanceOf(context, account);
  }

  /**
   * Queries the spending allowance granted by owner to spender.
   * @param context Circuit execution context.
   * @param owner 32-byte owner account address.
   * @param spender 32-byte spender account address.
   */
  public allowance(
    context: CircuitContext<PS>,
    owner: Uint8Array,
    spender: Uint8Array,
  ): CircuitResults<PS, bigint> {
    return this.contract.circuits.allowance(context, owner, spender);
  }

  /**
   * Transfers tokens from caller to the recipient address.
   * @param context Circuit execution context.
   * @param caller 32-byte sender account address.
   * @param to 32-byte recipient account address.
   * @param value Amount of tokens to transfer.
   */
  public transfer(
    context: CircuitContext<PS>,
    caller: Uint8Array,
    to: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, boolean> {
    return this.contract.circuits.transfer(context, caller, to, value);
  }

  /**
   * Approves a spender to withdraw up to value tokens from caller account.
   * @param context Circuit execution context.
   * @param caller 32-byte owner account address.
   * @param spender 32-byte spender account address.
   * @param value Max allowance granted.
   */
  public approve(
    context: CircuitContext<PS>,
    caller: Uint8Array,
    spender: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, boolean> {
    return this.contract.circuits.approve(context, caller, spender, value);
  }

  /**
   * Executes a transfer on behalf of fromAccount using pre-approved allowance.
   * @param context Circuit execution context.
   * @param caller 32-byte spender account address invoking the circuit.
   * @param fromAccount 32-byte source account address.
   * @param to 32-byte destination account address.
   * @param value Amount of tokens to transfer.
   */
  public transferFrom(
    context: CircuitContext<PS>,
    caller: Uint8Array,
    fromAccount: Uint8Array,
    to: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, boolean> {
    return this.contract.circuits.transferFrom(context, caller, fromAccount, to, value);
  }

  /**
   * Low-level transfer circuit execution.
   * @param context Circuit execution context.
   * @param fromAccount 32-byte sender address.
   * @param to 32-byte receiver address.
   * @param value Amount to transfer.
   */
  public _transfer(
    context: CircuitContext<PS>,
    fromAccount: Uint8Array,
    to: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, []> {
    return this.contract.circuits._transfer(context, fromAccount, to, value);
  }

  /**
   * Mints new tokens to the destination account, increasing total supply.
   * @param context Circuit execution context.
   * @param account 32-byte receiver address.
   * @param value Amount of tokens to mint.
   */
  public mint(
    context: CircuitContext<PS>,
    account: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, []> {
    return this.contract.circuits._mint(context, account, value);
  }

  /**
   * Burns tokens from the specified account, decreasing total supply.
   * @param context Circuit execution context.
   * @param account 32-byte sender address to burn tokens from.
   * @param value Amount of tokens to burn.
   */
  public burn(
    context: CircuitContext<PS>,
    account: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, []> {
    return this.contract.circuits._burn(context, account, value);
  }

  /**
   * Internal approval circuit execution updating the allowances map directly.
   * @param context Circuit execution context.
   * @param owner 32-byte owner address.
   * @param spender 32-byte spender address.
   * @param value Allowance amount.
   */
  public _approve(
    context: CircuitContext<PS>,
    owner: Uint8Array,
    spender: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, []> {
    return this.contract.circuits._approve(context, owner, spender, value);
  }

  /**
   * Deducts allowance spent by spender from owner's allowance limit.
   * @param context Circuit execution context.
   * @param owner 32-byte owner address.
   * @param spender 32-byte spender address.
   * @param value Amount deducted.
   */
  public _spendAllowance(
    context: CircuitContext<PS>,
    owner: Uint8Array,
    spender: Uint8Array,
    value: bigint,
  ): CircuitResults<PS, []> {
    return this.contract.circuits._spendAllowance(context, owner, spender, value);
  }

  /**
   * Parses raw on-chain state into a strongly-typed FungibleTokenLedgerState object.
   * @param rawState The raw state object from contract query context or indexer.
   * @returns Typed on-chain ledger state accessor.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown,
  ): FungibleTokenLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```