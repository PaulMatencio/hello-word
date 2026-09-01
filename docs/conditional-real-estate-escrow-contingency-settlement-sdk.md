# Technical Documentation & Production TypeScript Client SDK
**Contract**: `conditional-real-estate-escrow-contingency-settlement.compact`  
**Target Environment**: Midnight Blockchain / Compact v >= 0.23 / Midnight.js Compact Runtime

---

## Part 1: Comprehensive SDK Documentation

### 1. Contract Overview & Architecture

The `ConditionalRealEstateEscrowContingencySettlement` contract implements an automated, zero-knowledge conditional escrow protocol tailored for real estate transactions. It coordinates actions among four key participants:
1. **Buyer**: Funds the earnest money deposit, asserts financing clearance, or triggers a contingency refund.
2. **Seller**: Receives settlement proceeds upon fulfillment of all closing contingencies.
3. **Inspector**: Independent entity authorized to certify or reject physical property inspection.
4. **Title Agent**: Professional entity authorized to verify clean property title.

#### Public Ledger State (`export ledger`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `buyerPk` | `Bytes<32>` | Commitment / Derived public key of the authorized buyer (`persistentHash(buyerSecret)`). |
| `sellerPk` | `Bytes<32>` | Commitment / Derived public key of the authorized seller (`persistentHash(sellerSecret)`). |
| `inspectorPk` | `Bytes<32>` | Public key hash of the certified property inspector. |
| `titleAgentPk` | `Bytes<32>` | Public key hash of the authorized title clearance agent. |
| `propertyHash` | `Bytes<32>` | Unique cryptographic identifier / legal parcel hash of the real estate. |
| `purchasePrice` | `Uint<64>` | Agreed total purchase price. |
| `escrowDeposit` | `Uint<64>` | Required earnest money deposit to transition contract to `Funded`. |
| `inspectionPassed` | `Boolean` | Flag indicating whether physical inspection contingency has been satisfied. |
| `financingApproved` | `Boolean` | Flag indicating whether buyer/lender financing has been approved. |
| `titleCleared` | `Boolean` | Flag indicating whether clear title has been certified. |
| `status` | `EscrowStatus` | Lifecycle state: `Created` (0), `Funded` (1), `Settled` (2), `Refunded` (3). |

#### Private State & Witness Specification

All participants authenticate off-chain using Zero-Knowledge proofs. Private preimages (secrets) are queried by the client runtime via witness functions and hashed using `persistentHash<Bytes<32>>()`. The raw secrets are never exposed on-chain.

```compact
witness getBuyerSecret(): Bytes<32>;
witness getSellerSecret(): Bytes<32>;
witness getInspectorSecret(): Bytes<32>;
witness getTitleAgentSecret(): Bytes<32>;
```

#### Zero-Knowledge Circuit Assertions

1. **`depositEarnestMoney(amount: Uint<64>): []`**
   - **Preconditions**: `status == EscrowStatus.Created`, `amount >= escrowDeposit`, `persistentHash(getBuyerSecret()) == buyerPk`.
   - **Postconditions**: `status` set to `EscrowStatus.Funded`.

2. **`submitInspectionReport(passed: Boolean): []`**
   - **Preconditions**: `status == EscrowStatus.Funded`, `persistentHash(getInspectorSecret()) == inspectorPk`.
   - **Postconditions**: `inspectionPassed` set to `disclose(passed)`.

3. **`confirmFinancingApproval(approved: Boolean): []`**
   - **Preconditions**: `status == EscrowStatus.Funded`, `persistentHash(getBuyerSecret()) == buyerPk`.
   - **Postconditions**: `financingApproved` set to `disclose(approved)`.

4. **`submitTitleClearance(cleared: Boolean): []`**
   - **Preconditions**: `status == EscrowStatus.Funded`, `persistentHash(getTitleAgentSecret()) == titleAgentPk`.
   - **Postconditions**: `titleCleared` set to `disclose(cleared)`.

5. **`settleEscrow(): []`**
   - **Preconditions**: `status == EscrowStatus.Funded`, `inspectionPassed == true`, `financingApproved == true`, `titleCleared == true`.
   - **Signer Assertion**: `persistentHash(buyerSecret) == buyerPk || persistentHash(sellerSecret) == sellerPk`.
   - **Postconditions**: `status` set to `EscrowStatus.Settled`.

6. **`cancelAndRefund(): []`**
   - **Preconditions**: `status == EscrowStatus.Funded`, `persistentHash(buyerSecret) == buyerPk`, `(!inspectionPassed || !financingApproved || !titleCleared)`.
   - **Postconditions**: `status` set to `EscrowStatus.Refunded`.

---

### 2. Prerequisites & Installation

```bash
npm install @midnight-ntwrk/compact-runtime
```

Ensure your TypeScript project targets `ESNext` / `ES2022` with `"moduleResolution": "NodeNext"` or `"Bundler"`.

---

### 3. API Reference

#### `ConditionalRealEstateEscrowContingencySettlementClient<PS>`

```typescript
class ConditionalRealEstateEscrowContingencySettlementClient<PS extends ConditionalRealEstateEscrowContingencySettlementPrivateState>
```

- **`constructor(witnesses?: Partial<ConditionalRealEstateEscrowContingencySettlementWitnesses<PS>>)`**: Instantiates the contract wrapper with optional custom witness handlers.
- **`initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`**: Creates initial on-chain state and evaluates the constructor circuit.
- **`depositEarnestMoney(context: CircuitContext<PS>, amount: bigint): CircuitResults<PS, []>`**: Executes earnest money deposit.
- **`submitInspectionReport(context: CircuitContext<PS>, passed: boolean): CircuitResults<PS, []>`**: Submits inspection evaluation.
- **`confirmFinancingApproval(context: CircuitContext<PS>, approved: boolean): CircuitResults<PS, []>`**: Records loan/financing status.
- **`submitTitleClearance(context: CircuitContext<PS>, cleared: boolean): CircuitResults<PS, []>`**: Submits title clearance determination.
- **`settleEscrow(context: CircuitContext<PS>): CircuitResults<PS, []>`**: Completes escrow and triggers settlement.
- **`cancelAndRefund(context: CircuitContext<PS>): CircuitResults<PS, []>`**: Refunds deposit if contingencies fail.
- **`queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): ConditionalRealEstateEscrowContingencySettlementLedgerState`**: Parses raw contract ledger states into typed structures.

---

### 4. Step-by-Step Quickstart Walkthrough

Save the following file in `examples/conditional-real-estate-escrow-contingency-settlement-example.ts`:

```typescript
/**
 * Quickstart Example: ConditionalRealEstateEscrowContingencySettlement Client SDK
 *
 * How to run:
 *   npx tsx examples/conditional-real-estate-escrow-contingency-settlement-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext
} from '@midnight-ntwrk/compact-runtime';
import {
  ConditionalRealEstateEscrowContingencySettlementClient,
  type ConditionalRealEstateEscrowContingencySettlementPrivateState,
  EscrowStatus
} from '../src/client/conditional-real-estate-escrow-contingency-settlement-sdk.js';

// Helper to derive simulated 32-byte hash (for mock demo setup)
function mockHash(seed: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < seed.length && i < 32; i++) {
    bytes[i] = seed.charCodeAt(i);
  }
  return bytes;
}

async function main() {
  console.log('=== Conditional Real Estate Escrow Contingency Settlement Demo ===\n');

  // 1. Setup mock public key strings and contract addresses (32-byte hex strings in Midnight runtime)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // 2. Define off-chain private keys for actors
  const buyerSecret = new Uint8Array(32).fill(0xaa);
  const sellerSecret = new Uint8Array(32).fill(0xbb);
  const inspectorSecret = new Uint8Array(32).fill(0xcc);
  const titleAgentSecret = new Uint8Array(32).fill(0xdd);

  // In production, these public keys match persistentHash<Bytes<32>>(secret)
  // For the simulator context, we align the seeds:
  const buyerPk = buyerSecret;
  const sellerPk = sellerSecret;
  const inspectorPk = inspectorSecret;
  const titleAgentPk = titleAgentSecret;
  const propertyHash = mockHash('Parcel #1094-RealEstate-BeverlyHills');

  const purchasePrice = 1_250_000_000_000n; // Micro-units
  const escrowDeposit = 50_000_000_000n;

  // 3. Initialize private state container
  let currentPrivateState: ConditionalRealEstateEscrowContingencySettlementPrivateState = {
    buyerSecret,
    sellerSecret,
    inspectorSecret,
    titleAgentSecret,
  };

  // 4. Initialize client SDK
  const client = new ConditionalRealEstateEscrowContingencySettlementClient();

  // 5. Construct Initial Contract State
  const constructorCtx = createConstructorContext(
    currentPrivateState,
    coinPublicKey
  );

  // In Midnight runtime, constructor parameters are passed during constructor execution
  const initResult = client.initialState(constructorCtx);
  currentPrivateState = initResult.currentPrivateState;
  let currentChargedState = initResult.currentContractState.data;

  console.log('Contract initialized successfully.');
  let state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Initial Status: ${EscrowStatus[state.status]} (Code: ${state.status})`);
  console.log(`Inspection Passed: ${state.inspectionPassed}, Title Cleared: ${state.titleCleared}\n`);

  // 6. Buyer Deposits Earnest Money
  console.log('--- Step 1: Buyer deposits earnest money ---');
  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  
  let result = client.depositEarnestMoney(circuitCtx, escrowDeposit);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Updated Escrow Status: ${EscrowStatus[state.status]}\n`);

  // 7. Inspector Submits Inspection Report
  console.log('--- Step 2: Inspector passes physical inspection ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.submitInspectionReport(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Inspection Contingency Status: ${state.inspectionPassed}\n`);

  // 8. Buyer Confirms Loan/Financing Approval
  console.log('--- Step 3: Buyer confirms mortgage approval ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.confirmFinancingApproval(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Financing Contingency Status: ${state.financingApproved}\n`);

  // 9. Title Agent Clears Title
  console.log('--- Step 4: Title Agent submits title clearance ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.submitTitleClearance(circuitCtx, true);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Title Cleared Status: ${state.titleCleared}\n`);

  // 10. Settle Escrow
  console.log('--- Step 5: Final Settlement Execution ---');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );
  result = client.settleEscrow(circuitCtx);
  currentChargedState = result.context.currentQueryContext.state;
  currentPrivateState = result.context.privateState;
  state = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Final Escrow Lifecycle Status: ${EscrowStatus[state.status]}`);
  console.log('Transaction finalized without leaking private credentials!');
}

main().catch(console.error);
```

---

### 5. Privacy & Security Notes

1. **Witness Privacy**: Secrets (`buyerSecret`, `sellerSecret`, etc.) are retained inside the client's local memory (`PS`). Only zero-knowledge proofs and hashes are verified on-chain.
2. **Public Disclosure (`disclose`)**: As required by Compact v >= 0.23, boolean status flags and constructor values explicitly disclose non-confidential transition markers to maintain public verifiable state while preserving actor anonymity.
3. **Safe Storage**: Off-chain storage of private state must be guarded using hardware enclaves, encrypted Keyring stores, or web3 identity vaults.

---

## Part 2: Production TypeScript Client SDK Implementation

Below is the complete implementation for `src/client/conditional-real-estate-escrow-contingency-settlement-sdk.ts`:

```typescript
/**
 * Production TypeScript Client SDK for Conditional Real Estate Escrow Contingency Settlement.
 * Compact Language Version: >= 0.23
 *
 * Provides a strongly-typed, ZK-proof orchestrator for the real estate escrow contract.
 */

import {
  type CircuitContext,
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
} from '../../contracts/managed/conditional-real-estate-escrow-contingency-settlement/contract/index.js';

/**
 * Enumeration of on-chain escrow lifecycle states matching the Compact contract.
 */
export enum EscrowStatus {
  Created = 0,
  Funded = 1,
  Settled = 2,
  Refunded = 3,
}

/**
 * Strongly typed interface for the off-chain private state container.
 */
export interface ConditionalRealEstateEscrowContingencySettlementPrivateState {
  readonly buyerSecret?: Uint8Array;
  readonly sellerSecret?: Uint8Array;
  readonly inspectorSecret?: Uint8Array;
  readonly titleAgentSecret?: Uint8Array;
}

/**
 * Public Ledger State representation derived from compiled Compact artifacts.
 */
export type ConditionalRealEstateEscrowContingencySettlementLedgerState = ContractLedger;

/**
 * Type-safe interface for off-chain witness functions adhering to Midnight SDK conventions.
 * Every witness takes a WitnessContext<ContractLedger, PS> and returns [PS, T].
 */
export type ConditionalRealEstateEscrowContingencySettlementWitnesses<
  PS extends ConditionalRealEstateEscrowContingencySettlementPrivateState = ConditionalRealEstateEscrowContingencySettlementPrivateState,
> = ContractWitnesses<PS>;

/**
 * Default witness implementation providing extraction from the local private state container.
 */
export function createDefaultWitnesses<
  PS extends ConditionalRealEstateEscrowContingencySettlementPrivateState,
>(): ConditionalRealEstateEscrowContingencySettlementWitnesses<PS> {
  return {
    getBuyerSecret(context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] {
      const secret = context.privateState.buyerSecret ?? new Uint8Array(32);
      return [context.privateState, secret];
    },
    getSellerSecret(context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] {
      const secret = context.privateState.sellerSecret ?? new Uint8Array(32);
      return [context.privateState, secret];
    },
    getInspectorSecret(context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] {
      const secret = context.privateState.inspectorSecret ?? new Uint8Array(32);
      return [context.privateState, secret];
    },
    getTitleAgentSecret(context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] {
      const secret = context.privateState.titleAgentSecret ?? new Uint8Array(32);
      return [context.privateState, secret];
    },
  };
}

/**
 * Production Client SDK for interacting with the ConditionalRealEstateEscrowContingencySettlement smart contract.
 */
export class ConditionalRealEstateEscrowContingencySettlementClient<
  PS extends ConditionalRealEstateEscrowContingencySettlementPrivateState = ConditionalRealEstateEscrowContingencySettlementPrivateState,
> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs an instance of the escrow SDK client.
   *
   * @param customWitnesses - Optional overrides for contract witness generation functions.
   */
  constructor(
    customWitnesses?: Partial<ConditionalRealEstateEscrowContingencySettlementWitnesses<PS>>
  ) {
    const defaultWitnesses = createDefaultWitnesses<PS>();
    const effectiveWitnesses: ConditionalRealEstateEscrowContingencySettlementWitnesses<PS> = {
      ...defaultWitnesses,
      ...customWitnesses,
    };
    this.contract = new ManagedContract<PS>(effectiveWitnesses);
  }

  /**
   * Initializes the contract state via the constructor context.
   *
   * @param context - The Midnight constructor execution context.
   * @returns ConstructorResult containing initial contract and private states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `depositEarnestMoney` circuit.
   *
   * @param context - Circuit execution context with current state and private state.
   * @param amount - Earnest deposit amount to commit.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public depositEarnestMoney(
    context: CircuitContext<PS>,
    amount: bigint
  ): CircuitResults<PS, []> {
    return this.contract.circuits.depositEarnestMoney(context, amount);
  }

  /**
   * Executes the `submitInspectionReport` circuit by the authorized inspector.
   *
   * @param context - Circuit execution context.
   * @param passed - True if inspection passes, false otherwise.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public submitInspectionReport(
    context: CircuitContext<PS>,
    passed: boolean
  ): CircuitResults<PS, []> {
    return this.contract.circuits.submitInspectionReport(context, passed);
  }

  /**
   * Executes the `confirmFinancingApproval` circuit by the buyer.
   *
   * @param context - Circuit execution context.
   * @param approved - True if financing/mortgage is cleared, false otherwise.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public confirmFinancingApproval(
    context: CircuitContext<PS>,
    approved: boolean
  ): CircuitResults<PS, []> {
    return this.contract.circuits.confirmFinancingApproval(context, approved);
  }

  /**
   * Executes the `submitTitleClearance` circuit by the title agent.
   *
   * @param context - Circuit execution context.
   * @param cleared - True if title search and clearance is verified.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public submitTitleClearance(
    context: CircuitContext<PS>,
    cleared: boolean
  ): CircuitResults<PS, []> {
    return this.contract.circuits.submitTitleClearance(context, cleared);
  }

  /**
   * Executes the `settleEscrow` circuit when all conditions are met.
   *
   * @param context - Circuit execution context.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public settleEscrow(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.settleEscrow(context);
  }

  /**
   * Executes the `cancelAndRefund` circuit if contingencies fail.
   *
   * @param context - Circuit execution context.
   * @returns Circuit execution result containing the updated context and unit return `[]`.
   */
  public cancelAndRefund(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.cancelAndRefund(context);
  }

  /**
   * Decodes and parses raw contract state into the typed Compact Ledger state interface.
   *
   * @param rawState - The raw state or charged state returned from query contexts.
   * @returns Strongly-typed ledger state object.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): ConditionalRealEstateEscrowContingencySettlementLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```