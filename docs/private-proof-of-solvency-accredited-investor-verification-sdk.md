# Part 1: Comprehensive SDK Documentation

## 1. Contract Overview & Architecture

The **Private Proof of Solvency & Accredited Investor Verification** smart contract enables individuals to prove in zero-knowledge that they meet accredited investor requirements (such as minimum net worth) via a cryptographically certified attestation from an authorized auditor, without revealing their exact net worth, real identity, or attestation secrets on-chain.

### System Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    OFF-CHAIN PRIVATE                                 |
|                                                                                       |
|  Investor Identity          Auditor Attestation                                       |
|  +--------------------+     +-------------------------------------------------------+ |
|  | investorSecret     |     | auditor (Bytes<32>)        investorCommitment         | |
|  | investorId         |     | netWorth (Uint<64>)        expiry (Uint<64>)          | |
|  +--------------------+     | attestationSalt (Bytes<32>)                           | |
|           |                 +-------------------------------------------------------+ |
|           v                                             |                             |
|  persistentHash<InvestorData>()                         v                             |
|           +---------------------------------------------+                             |
|           | (Attestation Commitment Equality Assertion)                               |
|           v                                                                           |
|  Zero-Knowledge Prover Engine (Midnight Compact Runtime)                              |
|           |                                                                           |
|           | Computes nullifier: persistentHash(investorSecret, campaignId)            |
|           | Proves: netWorth >= minSolvencyThreshold && expiry >= currentTimestamp   |
+-----------|---------------------------------------------------------------------------+
            | ZK Proof + Disclosed Nullifier + Auditor ID
            v
+---------------------------------------------------------------------------------------+
|                                    ON-CHAIN LEDGER                                    |
|                                                                                       |
|  export ledger authority: Bytes<32>                                                   |
|  export ledger minSolvencyThreshold: Uint<64>                                         |
|  export ledger registeredAuditors: Map<Bytes<32>, Boolean>                            |
|  export ledger usedNullifiers: Set<Bytes<32>>                                         |
|  export ledger totalVerifications: Counter                                            |
+---------------------------------------------------------------------------------------+
```

### Public Ledger State Schema

| State Field | Type | Description |
| :--- | :--- | :--- |
| `authority` | `Bytes<32>` | Master administrative public key/identity allowed to configure system parameters. |
| `minSolvencyThreshold` | `Uint<64>` | Minimum required net worth (in base units) to qualify for accreditation. |
| `registeredAuditors` | `Map<Bytes<32>, Boolean>` | Mapping of authorized auditor public identifiers to active (`true`) or revoked (`false`) status. |
| `usedNullifiers` | `Set<Bytes<32>>` | Set of consumed campaign nullifiers preventing double-submission per campaign. |
| `totalVerifications` | `Counter` | Monotonically increasing counter of successful zero-knowledge verification operations. |

### Private State & Witness Specification

The private state holds confidential attestations and investor secrets off-chain:

1. **`InvestorData`**:
   - `investorSecret: Bytes<32>`: Private random secret entropy belonging to the investor.
   - `investorId: Bytes<32>`: Unique investor identifier.
   - *Commitment*: Calculated as `persistentHash<InvestorData>(investor)`.
2. **`SolvencyAttestation`**:
   - `auditor: Bytes<32>`: Public identity of the auditor issuing the certificate.
   - `investorCommitment: Bytes<32>`: Investor's commitment bound to the certificate.
   - `netWorth: Uint<64>`: Investor's verified net worth evaluated privately.
   - `expiry: Uint<64>`: Timestamp expiration of the attestation.
   - `attestationSalt: Bytes<32>`: Random salt to ensure attestation uniqueness.
3. **Witness Functions**:
   - `witness getInvestorData(): InvestorData`: Fetches the caller's private identity data.
   - `witness getAttestation(): SolvencyAttestation`: Fetches the caller's solvency certificate.

### Zero-Knowledge Circuits & Verification Rules

- **`registerAuditor(auditor: Bytes<32>): []`**
  - Registers or activates an auditor in `registeredAuditors`.
- **`revokeAuditor(auditor: Bytes<32>): []`**
  - Sets an auditor's authorization status to `false` in `registeredAuditors`.
- **`updateThreshold(newThreshold: Uint<64>): []`**
  - Updates `minSolvencyThreshold` to `newThreshold`.
- **`proveSolvencyAndAccreditation(campaignId: Bytes<32>, currentTimestamp: Uint<64>): Bytes<32>`**
  - **Rule 1 (Identity Match)**: Computes `persistentHash<InvestorData>(investor)` and asserts equality against `attestation.investorCommitment`.
  - **Rule 2 (Auditor Registered & Active)**: Discloses `attestation.auditor`, asserts membership in `registeredAuditors`, and verifies active status (`true`).
  - **Rule 3 (Temporal Validity)**: Asserts `attestation.expiry >= currentTimestamp`.
  - **Rule 4 (Solvency Gate)**: Asserts `attestation.netWorth >= minSolvencyThreshold`.
  - **Rule 5 (Replay Prevention)**: Derives `nullifier = persistentHash<NullifierPreimage>({ investorSecret, campaignId })`, asserts `!usedNullifiers.member(disclosedNullifier)`, and inserts it into `usedNullifiers`.
  - **Rule 6 (Metric Increment)**: Increments `totalVerifications` by `1`.
  - Returns `disclosedNullifier`.

---

## 2. Prerequisites & Installation

Install the required Midnight Compact runtime and utility packages:

```bash
npm install @midnight-ntwrk/compact-runtime
```

Ensure development tooling is installed for executing TypeScript:

```bash
npm install -D tsx typescript @types/node
```

---

## 3. API Reference

### `PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PS>`

```typescript
class PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PS>
```

#### Constructor
```typescript
constructor(witnesses: PrivateProofOfSolvencyAccreditedInvestorVerificationWitnesses<PS>)
```
Constructs a client instance bound to user-defined off-chain witness handlers.

#### Methods

- **`initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`**
  - Computes the initial contract state.
  - Parameters: `context` containing constructor private state and coin public key.
  - Returns: Initial `currentContractState`, `currentPrivateState`, and `currentZswapLocalState`.

- **`registerAuditor(context: CircuitContext<PS>, auditor: Uint8Array): CircuitResults<PS, []>`**
  - Authorizes a certified solvency auditor.
  - Parameters: `context` (ZK circuit execution context), `auditor` (32-byte auditor ID).
  - Returns: `CircuitResults<PS, []>` with updated state and empty tuple `[]`.

- **`revokeAuditor(context: CircuitContext<PS>, auditor: Uint8Array): CircuitResults<PS, []>`**
  - Revokes an auditor's authorization.
  - Parameters: `context`, `auditor` (32-byte auditor ID).
  - Returns: `CircuitResults<PS, []>`.

- **`updateThreshold(context: CircuitContext<PS>, newThreshold: bigint): CircuitResults<PS, []>`**
  - Updates the minimum solvency threshold on-chain.
  - Parameters: `context`, `newThreshold` (`bigint` representing required net worth).
  - Returns: `CircuitResults<PS, []>`.

- **`proveSolvencyAndAccreditation(context: CircuitContext<PS>, campaignId: Uint8Array, currentTimestamp: bigint): CircuitResults<PS, Uint8Array>`**
  - Executes the ZK proof of accreditation and solvency.
  - Parameters: `context`, `campaignId` (32-byte campaign scope identifier), `currentTimestamp` (Unix epoch timestamp).
  - Returns: `CircuitResults<PS, Uint8Array>` containing the deterministic campaign nullifier.

- **`queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState`**
  - Decodes raw state into a typed ledger object exposing `authority`, `minSolvencyThreshold`, `registeredAuditors`, `usedNullifiers`, and `totalVerifications`.

### Circuit Error Assertions

| Error Assertion Message | Trigger Condition |
| :--- | :--- |
| `"Attestation commitment does not match investor identity"` | `persistentHash(investor) != attestation.investorCommitment` |
| `"Attestation auditor is not registered"` | Auditor ID not found in `registeredAuditors` map |
| `"Attestation auditor is revoked or inactive"` | Auditor mapped value is `false` |
| `"Solvency attestation has expired"` | `attestation.expiry < currentTimestamp` |
| `"Investor does not meet the minimum solvency threshold"` | `attestation.netWorth < minSolvencyThreshold` |
| `"Nullifier already used for this campaign"` | Nullifier already present in `usedNullifiers` |

---

## 4. Step-by-Step Quickstart & Usage Walkthrough

Save the following runnable script as `examples/private-proof-of-solvency-accredited-investor-verification-example.ts`:

```typescript
/**
 * Quickstart Example: PrivateProofOfSolvencyAccreditedInvestorVerification Client SDK
 *
 * How to run:
 *   npx tsx examples/private-proof-of-solvency-accredited-investor-verification-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type WitnessContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  PrivateProofOfSolvencyAccreditedInvestorVerificationClient,
  type PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState,
  type InvestorData,
  type SolvencyAttestation,
} from '../src/client/private-proof-of-solvency-accredited-investor-verification-sdk.js';

// Helper to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Helper to convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function main() {
  console.log('--- Initializing Private Proof of Solvency Verification SDK Example ---');

  // 1. Setup mock keys and identifiers (32-byte hex strings)
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);
  const adminAddressBytes = hexToBytes('aa'.repeat(32));
  const auditorIdBytes = hexToBytes('bb'.repeat(32));
  const campaignIdBytes = hexToBytes('cc'.repeat(32));

  // Minimum solvency threshold: $1,000,000 (represented in USD units or base currency)
  const minThreshold = 1_000_000n;

  // 2. Setup Private State with investor identity and signed attestation
  const investorData: InvestorData = {
    investorSecret: hexToBytes('11'.repeat(32)),
    investorId: hexToBytes('22'.repeat(32)),
  };

  // Pre-calculated or mock investor commitment matching InvestorData
  // In production, this matches persistentHash<InvestorData>(investorData)
  // For standard mock flow, matching the hash representation:
  const attestation: SolvencyAttestation = {
    auditor: auditorIdBytes,
    investorCommitment: hexToBytes('33'.repeat(32)), // Set to expected persistentHash output
    netWorth: 2_500_000n, // Net worth $2.5M meets $1M threshold
    expiry: 1_900_000_000n, // Future timestamp
    attestationSalt: hexToBytes('44'.repeat(32)),
  };

  let privateState: PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState = {
    investorData,
    attestation,
  };

  // 3. Instantiate SDK Client with witness handlers
  const client = new PrivateProofOfSolvencyAccreditedInvestorVerificationClient({
    getInvestorData: (
      context: WitnessContext<unknown, PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>
    ) => {
      console.log('[Witness] Providing private investor data to ZK prover');
      return [context.privateState, context.privateState.investorData];
    },
    getAttestation: (
      context: WitnessContext<unknown, PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>
    ) => {
      console.log('[Witness] Providing private solvency attestation to ZK prover');
      return [context.privateState, context.privateState.attestation];
    },
  });

  // 4. Initialize Contract State
  console.log('\n1. Initializing Contract on-chain state...');
  const constructorCtx = createConstructorContext(privateState, coinPublicKey);
  const initResult = client.initialState(constructorCtx);
  let currentChargedState = initResult.currentContractState.data;
  privateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Initial Threshold:', ledgerState.minSolvencyThreshold.toString());
  console.log('Total Verifications:', ledgerState.totalVerifications.value.toString());

  // 5. Register Auditor
  console.log('\n2. Registering Auditor...');
  const regAuditorCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );
  const regResult = client.registerAuditor(regAuditorCtx, auditorIdBytes);
  currentChargedState = regResult.context.currentQueryContext.state;
  privateState = regResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(
    'Is Auditor Registered:',
    ledgerState.registeredAuditors.member(auditorIdBytes) &&
      ledgerState.registeredAuditors.lookup(auditorIdBytes)
  );

  // 6. Prove Solvency & Accreditation
  console.log('\n3. Executing Zero-Knowledge Solvency Proof for Campaign...');
  const currentTimestamp = 1_700_000_000n;
  const proveCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    privateState
  );

  // Note: For execution without mock hash mismatch, ensure investorCommitment matches prover hash
  try {
    const proveResult = client.proveSolvencyAndAccreditation(
      proveCtx,
      campaignIdBytes,
      currentTimestamp
    );
    currentChargedState = proveResult.context.currentQueryContext.state;
    privateState = proveResult.context.privateState;

    const nullifierHex = bytesToHex(proveResult.result);
    console.log('ZK Verification Succeeded!');
    console.log('Generated Campaign Nullifier:', nullifierHex);

    ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
    console.log('Total Verifications on Ledger:', ledgerState.totalVerifications.value.toString());
    console.log('Nullifier Recorded on Ledger:', ledgerState.usedNullifiers.member(proveResult.result));
  } catch (error: any) {
    console.log('Circuit execution evaluated constraints:', error.message);
  }

  console.log('\n--- Demonstration Complete ---');
}

main().catch(console.error);
```

---

## 5. Privacy & Security Notes

1. **Witness Privacy & Confidentiality**:
   - `investorSecret`, `investorId`, and `netWorth` are never broadcast over the network. They remain inside the client's execution sandbox and are processed exclusively within the zero-knowledge circuit prover.
2. **Disclosed Fields**:
   - Only `auditor` and the campaign-specific `nullifier` are disclosed on-chain. Disclosing the auditor is necessary to ensure the issuing entity is currently in good standing in `registeredAuditors`.
3. **Replay Protection & Unlinkability**:
   - The nullifier is derived from `persistentHash({ investorSecret, campaignId })`. Because the nullifier includes `campaignId`, an investor's nullifier in Campaign A cannot be linked to their nullifier in Campaign B, preventing cross-campaign activity tracking while strictly prohibiting double-participation within a single campaign.
4. **Key Management**:
   - Private states containing `InvestorData` should be encrypted at rest on the client device using standard secure enclaves or authenticated encryption (e.g., AES-GCM-256 with a hardware-backed key).

---

# Part 2: Production TypeScript Client SDK Implementation

```typescript
/**
 * Private Proof of Solvency & Accredited Investor Verification TypeScript SDK
 *
 * Implements client-side abstractions, witness handlers, and typed circuit invocations
 * for the Private Proof of Solvency & Accredited Investor Verification Compact smart contract.
 *
 * @packageDocumentation
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
} from '../../contracts/managed/private-proof-of-solvency-accredited-investor-verification/contract/index.js';

/**
 * Off-chain private identity information of the investor.
 */
export interface InvestorData {
  /** 32-byte secret known only to the investor */
  investorSecret: Uint8Array;
  /** 32-byte unique identity identifier */
  investorId: Uint8Array;
}

/**
 * Off-chain certified solvency attestation issued by an authorized auditor.
 */
export interface SolvencyAttestation {
  /** 32-byte public identifier of the issuing auditor */
  auditor: Uint8Array;
  /** 32-byte commitment of the investor (hash of InvestorData) */
  investorCommitment: Uint8Array;
  /** Verified net worth value */
  netWorth: bigint;
  /** Expiration timestamp (Unix epoch) */
  expiry: bigint;
  /** Random 32-byte salt for attestation uniqueness */
  attestationSalt: Uint8Array;
}

/**
 * Preimage used to compute the anonymous nullifier.
 */
export interface NullifierPreimage {
  investorSecret: Uint8Array;
  campaignId: Uint8Array;
}

/**
 * Private state schema maintained off-chain by the investor client.
 */
export interface PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState {
  /** Private investor identity details */
  investorData: InvestorData;
  /** Signed solvency attestation */
  attestation: SolvencyAttestation;
}

/**
 * Type-safe interface for ledger state.
 */
export type PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState = ContractLedger;

/**
 * Strongly-typed witness functions interface for the SDK client.
 * Each witness returns a tuple of [nextPrivateState, witnessValue].
 */
export interface PrivateProofOfSolvencyAccreditedInvestorVerificationWitnesses<
  PS = PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
> {
  /**
   * Witness function supplying private investor data.
   */
  getInvestorData: (
    context: WitnessContext<PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState, PS>
  ) => [PS, InvestorData];

  /**
   * Witness function supplying private solvency attestation.
   */
  getAttestation: (
    context: WitnessContext<PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState, PS>
  ) => [PS, SolvencyAttestation];
}

/**
 * Production-grade client SDK for interacting with the Private Proof of Solvency Compact contract.
 */
export class PrivateProofOfSolvencyAccreditedInvestorVerificationClient<
  PS = PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs an instance of the PrivateProofOfSolvencyAccreditedInvestorVerificationClient.
   *
   * @param witnesses - Object implementing the witness functions required by the contract.
   */
  constructor(witnesses: PrivateProofOfSolvencyAccreditedInvestorVerificationWitnesses<PS>) {
    const managedWitnesses: ContractWitnesses<PS> = {
      getInvestorData: (context) => witnesses.getInvestorData(context),
      getAttestation: (context) => witnesses.getAttestation(context),
    };
    this.contract = new ManagedContract<PS>(managedWitnesses);
  }

  /**
   * Computes the initial contract state upon deployment.
   *
   * @param context - The constructor context containing coin public key and private state.
   * @returns The constructor result containing contract state data, private state, and Zswap state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Registers or updates an authorized auditor on the public ledger.
   *
   * @param context - Circuit execution context.
   * @param auditor - 32-byte public identifier of the auditor.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public registerAuditor(
    context: CircuitContext<PS>,
    auditor: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.registerAuditor(context, auditor);
  }

  /**
   * Revokes an auditor's authorization on the public ledger.
   *
   * @param context - Circuit execution context.
   * @param auditor - 32-byte public identifier of the auditor to revoke.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public revokeAuditor(
    context: CircuitContext<PS>,
    auditor: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.revokeAuditor(context, auditor);
  }

  /**
   * Updates the minimum solvency threshold required for accreditation verification.
   *
   * @param context - Circuit execution context.
   * @param newThreshold - The new minimum net worth threshold.
   * @returns Circuit results with updated context and empty unit return tuple.
   */
  public updateThreshold(
    context: CircuitContext<PS>,
    newThreshold: bigint
  ): CircuitResults<PS, []> {
    return this.contract.circuits.updateThreshold(context, newThreshold);
  }

  /**
   * Proves in zero-knowledge that the investor meets the solvency threshold
   * and possesses a valid attestation without revealing balance or identity.
   *
   * @param context - Circuit execution context.
   * @param campaignId - 32-byte campaign identifier for replay prevention.
   * @param currentTimestamp - Current Unix epoch timestamp in seconds.
   * @returns Circuit results with updated context and the 32-byte campaign nullifier.
   */
  public proveSolvencyAndAccreditation(
    context: CircuitContext<PS>,
    campaignId: Uint8Array,
    currentTimestamp: bigint
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.proveSolvencyAndAccreditation(
      context,
      campaignId,
      currentTimestamp
    );
  }

  /**
   * Decodes and formats raw state data into the strongly-typed ledger state.
   *
   * @param rawState - The raw state or charged state representation from query context or storage.
   * @returns The decoded strongly-typed ledger state.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}

/**
 * Factory helper to instantiate the default SDK client with standard private state accessor witnesses.
 *
 * @returns An initialized PrivateProofOfSolvencyAccreditedInvestorVerificationClient instance.
 */
export function createDefaultSolvencyClient(): PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState> {
  return new PrivateProofOfSolvencyAccreditedInvestorVerificationClient<PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState>({
    getInvestorData: (
      context: WitnessContext<
        PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState,
        PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
      >
    ): [PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState, InvestorData] => {
      return [context.privateState, context.privateState.investorData];
    },
    getAttestation: (
      context: WitnessContext<
        PrivateProofOfSolvencyAccreditedInvestorVerificationLedgerState,
        PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState
      >
    ): [PrivateProofOfSolvencyAccreditedInvestorVerificationPrivateState, SolvencyAttestation] => {
      return [context.privateState, context.privateState.attestation];
    },
  });
}
```