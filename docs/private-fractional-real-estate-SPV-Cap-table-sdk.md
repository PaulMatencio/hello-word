# Technical Documentation & Client SDK: Private Fractional Real Estate SPV Cap Table

---

## Part 1: Comprehensive Technical Documentation

### 1. Contract Overview & Architecture

The **Private Fractional Real Estate SPV Cap Table** smart contract (`private-fractional-real-estate-SPV-Cap-table.compact`) enables confidential, regulatory-compliant cap table management for real estate Special Purpose Vehicles (SPVs) on the Midnight blockchain. 

Traditional fractional real estate systems publish investor addresses, holding amounts, and transfer activities publicly on-chain. This contract implements a privacy-preserving **Nullifier–Commitment UTXO model** in Zero-Knowledge (ZK), allowing:
- **Confidential Cap Tables**: Individual investor balances, addresses, and transaction amounts remain private.
- **Auditable Issuance**: The SPV Manager can mint fractional shares up to a strict, publicly enforced authorization cap (`totalAuthorizedShares`).
- **Private Fractional Transfers**: Investors can transfer fractional ownership privately to other authenticated investors, consuming spent commitments and creating new commitments without revealing transaction amounts or identities.
- **Zero-Knowledge Threshold Proofs**: Investors can prove ownership of at least $N$ shares (for investor accreditation, voting quorum, or dividend eligibility) without revealing their total balance or public identity.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Public Ledger (Midnight)                 │
                    ├────────────────────────────────────────────────────────┤
                    │ • manager (Bytes<32> PK hash)                          │
                    │ • propertyId (Bytes<32>)                               │
                    │ • totalAuthorizedShares / totalIssuedShares (Uint<64>) │
                    │ • commitments (Set<Bytes<32>>)                         │
                    │ • nullifiers (Set<Bytes<32>>)                          │
                    └───────────────────────────▲────────────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                  Zero-Knowledge Proofs                      │
                 ├──────────────────────────────┬──────────────────────────────┤
                 │         issueShares          │        transferShares        │
                 │   • Authenticates Manager    │   • Proves holding ownership │
                 │   • Enforces Authorized Cap  │   • Computes Nullifier       │
                 │   • Inserts new Commitment   │   • Splits UTXO & Change     │
                 └──────────────────────────────┴──────────────────────────────┘
```

#### Public Ledger State Schema

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `manager` | `Bytes<32>` | Persistent hash of the SPV Manager's secret key (`persistentHash(managerSk)`). |
| `propertyId` | `Bytes<32>` | Unique asset identifier representing the real estate property SPV. |
| `totalAuthorizedShares` | `Uint<64>` | Maximum number of fractional shares authorized for issuance by SPV bylaws. |
| `totalIssuedShares` | `Uint<64>` | Current sum of all issued shares to date ($totalIssuedShares \le totalAuthorizedShares$). |
| `commitments` | `Set<Bytes<32>>` | Set of valid, unblinded share commitments (`persistentHash(ShareHolding)`). |
| `nullifiers` | `Set<Bytes<32>>` | Set of consumed nullifiers preventing double-spending of share holdings. |

#### Private State & Off-Chain Witness Model

Investors and managers maintain private off-chain state containing secret keys, salt preimages, and their personal holding commitments:
- **Share Holding Structure (`ShareHolding`)**:
  - `ownerPk: Bytes<32>`: Hash of the owner's private key (`persistentHash(ownerSk)`).
  - `amount: Uint<64>`: Exact quantity of fractional real estate shares.
  - `salt: Bytes<32>`: 256-bit cryptographically secure random scalar.
- **Commitment Formula**:
  $$\text{Commitment} = \text{persistentHash}(\text{ShareHolding}\{\text{ownerPk}, \text{amount}, \text{salt}\})$$
- **Nullifier Formula**:
  $$\text{Nullifier} = \text{persistentHash}(\text{NullifierData}\{\text{commitment}, \text{secretKey}\})$$
- **Witnesses**:
  - `witness getSenderSecretKey(): Bytes<32>`: Fetches the caller's private signing key.
  - `witness getShareHoldingSalt(): Bytes<32>`: Generates or retrieves blinding salts for private commitments.

#### Zero-Knowledge Circuits & Constraints

1. **`constructor(initialManager, initialPropertyId, authorizedShares)`**:
   - Initialises ledger state with disclosed initial parameters and sets `totalIssuedShares = 0`.
2. **`issueShares(managerSk, investorPk, amount, salt): Bytes<32>`**:
   - Asserts $\text{persistentHash}(managerSk) == manager$.
   - Asserts $totalIssuedShares + amount \le totalAuthorizedShares$.
   - Inserts commitment into `commitments` and increments `totalIssuedShares`.
3. **`transferShares(senderSk, currentAmount, currentSalt, transferAmount, recipientPk, recipientSalt, changeSalt): TransferOutput`**:
   - Validates existence of current holding commitment in `commitments`.
   - Proves nullifier is unused in `nullifiers`, then registers it.
   - Enforces conservation of shares ($currentAmount \ge transferAmount$).
   - Inserts new recipient commitment and sender change commitment into `commitments`.
4. **`proveShareThreshold(ownerSk, amount, salt, threshold): Boolean`**:
   - Verifies holding commitment exists and is unspent (not in `nullifiers`).
   - Asserts $amount \ge threshold$.

---

### 2. Prerequisites & Installation

Add the required Midnight runtime and TypeScript dependencies:

```bash
npm install @midnight-ntwrk/compact-runtime
npm install -D typescript tsx @types/node
```

Ensure your `tsconfig.json` specifies module resolution for ES modules:

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

### 3. API Reference

#### `PrivateFractionalRealEstateSPVCapTableClient`

```typescript
class PrivateFractionalRealEstateSPVCapTableClient<PS extends PrivateFractionalRealEstateSPVCapTablePrivateState>
```

##### Constructor

```typescript
constructor(witnesses: PrivateFractionalRealEstateSPVCapTableWitnesses<PS>)
```

##### Methods

- **`initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`**
  - Generates initial contract state, private state, and ZK swap state.

- **`issueShares(context: CircuitContext<PS>, managerSk: Uint8Array, investorPk: Uint8Array, amount: bigint, salt: Uint8Array): CircuitResults<PS, Uint8Array>`**
  - Executes the `issueShares` circuit.
  - Returns `CircuitResults` with the resulting 32-byte commitment.

- **`transferShares(context: CircuitContext<PS>, senderSk: Uint8Array, currentAmount: bigint, currentSalt: Uint8Array, transferAmount: bigint, recipientPk: Uint8Array, recipientSalt: Uint8Array, changeSalt: Uint8Array): CircuitResults<PS, { recipientCommitment: Uint8Array; changeCommitment: Uint8Array }>`**
  - Executes the `transferShares` circuit to split and re-allocate shares.
  - Returns recipient and change commitments.

- **`proveShareThreshold(context: CircuitContext<PS>, ownerSk: Uint8Array, amount: bigint, salt: Uint8Array, threshold: bigint): CircuitResults<PS, boolean>`**
  - Generates a ZK proof that the caller holds $\ge threshold$ shares without revealing identity or total balance.

- **`queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): PrivateFractionalRealEstateSPVCapTableLedgerState`**
  - Parses and decodes on-chain ledger state into a typed object representation.

---

### 4. Step-by-Step Quickstart & Usage Walkthrough

Save the following file as `examples/private-fractional-real-estate-SPV-Cap-table-example.ts`.

```typescript
/**
 * Quickstart Example: PrivateFractionalRealEstateSPVCapTable Client SDK
 *
 * How to run:
 *   npx tsx examples/private-fractional-real-estate-SPV-Cap-table-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';
import {
  PrivateFractionalRealEstateSPVCapTableClient,
  type PrivateFractionalRealEstateSPVCapTablePrivateState,
  type PrivateFractionalRealEstateSPVCapTableWitnesses,
} from '../src/client/private-fractional-real-estate-SPV-Cap-table-sdk.js';

// Helper to generate 32-byte Uint8Array buffers
function createBytes32(fillByte: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.fill(fillByte);
  return bytes;
}

// Convert byte arrays to hex strings
function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

async function main(): Promise<void> {
  console.log('=== Private Fractional Real Estate SPV Cap Table Initialization ===\n');

  // 1. Setup Mock Identities & Cryptographic Keys
  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  const managerSk = createBytes32(0xaa);
  const managerPk = createBytes32(0xbb); // In production: persistentHash(managerSk)
  const propertyId = createBytes32(0x11); // e.g. Hash of deed / parcel registration
  const authorizedShares = 1_000_000n; // 1 Million Fractional SPV Shares

  const investorAliceSk = createBytes32(0x12);
  const investorAlicePk = createBytes32(0x22);
  const investorBobPk = createBytes32(0x33);

  // 2. Define Private State & Off-chain Witnesses
  const initialPrivateState: PrivateFractionalRealEstateSPVCapTablePrivateState = {
    secretKey: managerSk,
    salts: [createBytes32(0x55), createBytes32(0x66), createBytes32(0x77)],
    knownHoldings: [],
  };

  const witnesses: PrivateFractionalRealEstateSPVCapTableWitnesses<PrivateFractionalRealEstateSPVCapTablePrivateState> = {
    getSenderSecretKey: (context) => {
      return [context.privateState, context.privateState.secretKey];
    },
    getShareHoldingSalt: (context) => {
      const nextSalt = context.privateState.salts[0] || createBytes32(0x99);
      const remainingSalts = context.privateState.salts.slice(1);
      const updatedState = {
        ...context.privateState,
        salts: remainingSalts,
      };
      return [updatedState, nextSalt];
    },
  };

  // 3. Initialize Contract Client and Context
  const client = new PrivateFractionalRealEstateSPVCapTableClient(witnesses);
  const constructorContext = createConstructorContext(initialPrivateState, coinPublicKey);

  console.log('Deploying contract and initializing state...');
  const initResult = client.initialState(constructorContext);

  let currentChargedState: StateValue | ChargedState = initResult.currentContractState.data;
  let currentPrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Property ID: ${toHex(ledgerState.propertyId)}`);
  console.log(`Total Authorized Shares: ${ledgerState.totalAuthorizedShares.toString()}`);
  console.log(`Total Issued Shares: ${ledgerState.totalIssuedShares.toString()}\n`);

  // 4. Issue Shares to Alice
  console.log('--- Step 1: SPV Manager Issues 100,000 Shares to Alice ---');
  const aliceIssueAmount = 100_000n;
  const aliceSalt = createBytes32(0xa1);

  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );

  const issueResult = client.issueShares(
    circuitCtx,
    managerSk,
    investorAlicePk,
    aliceIssueAmount,
    aliceSalt
  );

  currentChargedState = issueResult.context.currentQueryContext.state;
  currentPrivateState = issueResult.context.privateState;

  const aliceCommitment = issueResult.result;
  console.log(`Share Commitment Created: 0x${toHex(aliceCommitment)}`);

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Total Issued Shares on Ledger: ${ledgerState.totalIssuedShares.toString()}`);
  console.log(`Commitments count: ${ledgerState.commitments.size()}`);
  console.log(`Nullifiers count: ${ledgerState.nullifiers.size()}\n`);

  // 5. Alice Transfers 25,000 Shares to Bob (Confidential Transfer)
  console.log('--- Step 2: Alice Privately Transfers 25,000 Shares to Bob ---');
  const transferAmount = 25_000n;
  const bobSalt = createBytes32(0xb1);
  const aliceChangeSalt = createBytes32(0xa2);

  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    {
      ...currentPrivateState,
      secretKey: investorAliceSk,
    }
  );

  const transferResult = client.transferShares(
    circuitCtx,
    investorAliceSk,
    aliceIssueAmount,
    aliceSalt,
    transferAmount,
    investorBobPk,
    bobSalt,
    aliceChangeSalt
  );

  currentChargedState = transferResult.context.currentQueryContext.state;
  currentPrivateState = transferResult.context.privateState;

  console.log(`Bob Commitment:    0x${toHex(transferResult.result.recipientCommitment)}`);
  console.log(`Alice Change UTXO:  0x${toHex(transferResult.result.changeCommitment)}`);

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log(`Commitments count: ${ledgerState.commitments.size()}`);
  console.log(`Nullifiers count:  ${ledgerState.nullifiers.size()} (1 consumed nullifier)\n`);

  // 6. Bob Proves Threshold Ownership (e.g. >= 20,000 shares for Voting)
  console.log('--- Step 3: Bob Proves Shareholding >= 20,000 in Zero-Knowledge ---');
  const thresholdRequirement = 20_000n;

  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    currentPrivateState
  );

  const proofResult = client.proveShareThreshold(
    circuitCtx,
    investorBobPk, // ownerSk used to evaluate nullifier/commitment
    transferAmount,
    bobSalt,
    thresholdRequirement
  );

  console.log(`Threshold Proof Verified: ${proofResult.result}`);
  console.log('\n=== Cap Table Lifecycle Simulation Complete ===');
}

main().catch((error) => {
  console.error('Error running SDK example:', error);
  process.exit(1);
});
```

---

### 5. Privacy & Security Notes

1. **Deterministic Nullifier Generation**: Nullifiers are computed as `persistentHash(NullifierData { commitment, secretKey })`. Because `secretKey` is private to the owner, external observers cannot correlate an unspent commitment to its eventual nullifier until spent.
2. **Salt Entropy**: Every `ShareHolding` MUST use a cryptographically strong pseudo-random 256-bit salt. Reusing salts allows rainbow-table brute force on common share amounts.
3. **Public Ledger Information**: The only items revealed on-chain are the `totalAuthorizedShares`, `totalIssuedShares`, property identifier, and opaque sets of 32-byte commitments and nullifiers. No amounts, investor addresses, or transaction graphs are disclosed.

---

## Part 2: Production TypeScript Client SDK Implementation

Below is the complete implementation for `src/client/private-fractional-real-estate-SPV-Cap-table-sdk.ts`:

```typescript
/**
 * Midnight Compact Client SDK
 * Contract: Private Fractional Real Estate SPV Cap Table
 * Architecture: Nullifier-Commitment UTXO Private Cap Table
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
} from '../../contracts/managed/private-fractional-real-estate-SPV-Cap-table/contract/index.js';

/**
 * Representation of a private shareholding position held off-chain by an investor.
 */
export interface PrivateShareHoldingRecord {
  ownerPk: Uint8Array;
  amount: bigint;
  salt: Uint8Array;
  commitment?: Uint8Array;
}

/**
 * Client private state structure stored securely off-chain.
 */
export interface PrivateFractionalRealEstateSPVCapTablePrivateState {
  readonly secretKey: Uint8Array;
  readonly salts: readonly Uint8Array[];
  readonly knownHoldings?: readonly PrivateShareHoldingRecord[];
}

/**
 * Result structure returned by private share transfers.
 */
export interface TransferOutputResult {
  recipientCommitment: Uint8Array;
  changeCommitment: Uint8Array;
}

/**
 * Type-safe interface for ledger state.
 */
export type PrivateFractionalRealEstateSPVCapTableLedgerState = ContractLedger;

/**
 * Off-chain witness signatures expected by the Compact runtime.
 * Each witness receives a WitnessContext and returns a tuple [NextPrivateState, ReturnValue].
 */
export interface PrivateFractionalRealEstateSPVCapTableWitnesses<
  PS extends PrivateFractionalRealEstateSPVCapTablePrivateState = PrivateFractionalRealEstateSPVCapTablePrivateState
> {
  getSenderSecretKey: (
    context: WitnessContext<ContractLedger, PS>
  ) => [PS, Uint8Array];
  getShareHoldingSalt: (
    context: WitnessContext<ContractLedger, PS>
  ) => [PS, Uint8Array];
}

/**
 * Production Client SDK for Private Fractional Real Estate SPV Cap Table smart contract.
 */
export class PrivateFractionalRealEstateSPVCapTableClient<
  PS extends PrivateFractionalRealEstateSPVCapTablePrivateState = PrivateFractionalRealEstateSPVCapTablePrivateState
> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes the Client SDK with required private state witness handlers.
   * @param witnesses Off-chain witness mapping.
   */
  constructor(witnesses: PrivateFractionalRealEstateSPVCapTableWitnesses<PS>) {
    const contractWitnesses: ContractWitnesses<PS> = {
      getSenderSecretKey: (context: WitnessContext<ContractLedger, PS>) => {
        return witnesses.getSenderSecretKey(context);
      },
      getShareHoldingSalt: (context: WitnessContext<ContractLedger, PS>) => {
        return witnesses.getShareHoldingSalt(context);
      },
    };

    this.contract = new ManagedContract<PS>(contractWitnesses);
  }

  /**
   * Builds the initial contract and private state context during deployment.
   * @param context Constructor context with private state and coin public key.
   * @returns Initial deployment states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Issues private fractional shares to an investor. Only executable by SPV manager.
   * 
   * @param context Circuit execution context.
   * @param managerSk Secret key of the SPV manager for authorization.
   * @param investorPk Public key / address identifier of recipient investor.
   * @param amount Number of fractional shares to issue.
   * @param salt Random salt blinding the holding commitment.
   * @returns Circuit result with newly created commitment hash.
   */
  public issueShares(
    context: CircuitContext<PS>,
    managerSk: Uint8Array,
    investorPk: Uint8Array,
    amount: bigint,
    salt: Uint8Array
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.issueShares(
      context,
      managerSk,
      investorPk,
      amount,
      salt
    );
  }

  /**
   * Privately transfers fractional shares from caller to recipient using a nullifier-commitment UTXO split.
   * 
   * @param context Circuit execution context.
   * @param senderSk Secret key of the sending investor.
   * @param currentAmount Total shares in the holding being spent.
   * @param currentSalt Salt used in the spent holding.
   * @param transferAmount Shares to transfer to the recipient.
   * @param recipientPk Public key of the recipient investor.
   * @param recipientSalt Blinding salt for recipient's commitment.
   * @param changeSalt Blinding salt for sender's change commitment.
   * @returns Circuit result containing both recipient and change commitments.
   */
  public transferShares(
    context: CircuitContext<PS>,
    senderSk: Uint8Array,
    currentAmount: bigint,
    currentSalt: Uint8Array,
    transferAmount: bigint,
    recipientPk: Uint8Array,
    recipientSalt: Uint8Array,
    changeSalt: Uint8Array
  ): CircuitResults<PS, TransferOutputResult> {
    return this.contract.circuits.transferShares(
      context,
      senderSk,
      currentAmount,
      currentSalt,
      transferAmount,
      recipientPk,
      recipientSalt,
      changeSalt
    );
  }

  /**
   * Proves in zero-knowledge that the caller owns at least `threshold` shares without revealing balance or identity.
   * 
   * @param context Circuit execution context.
   * @param ownerSk Secret key of the share owner.
   * @param amount Exact share quantity in the holding.
   * @param salt Blinding salt of the holding.
   * @param threshold Minimum share threshold required.
   * @returns Circuit result with boolean verification indicator.
   */
  public proveShareThreshold(
    context: CircuitContext<PS>,
    ownerSk: Uint8Array,
    amount: bigint,
    salt: Uint8Array,
    threshold: bigint
  ): CircuitResults<PS, boolean> {
    return this.contract.circuits.proveShareThreshold(
      context,
      ownerSk,
      amount,
      salt,
      threshold
    );
  }

  /**
   * Decodes and formats raw on-chain state into strongly-typed ledger state.
   * @param rawState Raw charged state or state value from query context.
   * @returns Typed PrivateFractionalRealEstateSPVCapTableLedgerState object.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): PrivateFractionalRealEstateSPVCapTableLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```