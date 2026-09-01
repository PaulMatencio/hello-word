# Technical Documentation and TypeScript Client SDK

---

## Part 1: Comprehensive SDK Documentation

### 1. Contract Overview & Architecture

The **Confidential Sealed-Bid Real Estate Auction** contract manages private, verifiable sealed-bid auctions on the Midnight blockchain. It enforces auction stages, fair commitment registrations, cryptographic bid reveals, reserve price verification, and highest-bidder resolution while keeping bid amounts confidential until the reveal phase.

```
+-------------------------------------------------------------------------------+
|                            AUCTION LIFECYCLE                                  |
|                                                                               |
|   +---------------+        closeBidding()        +----------------+           |
|   |    Bidding    | ---------------------------> |   Revealing    |           |
|   +---------------+                              +----------------+           |
|     ^           |                                  |            |             |
|     |           | submitBid(bidderId, commit)      |            | revealBid() |
|     +-----------+                                  |            v             |
|                                                    |     +--------------+     |
|                                  finalizeAuction() |     | Update Top   |     |
|                                                    +---> | Bidder & Bid |     |
|                                                    |     +--------------+     |
|                                                    v                          |
|                                            +---------------+                  |
|                                            |   Finalized   |                  |
|                                            +---------------+                  |
+-------------------------------------------------------------------------------+
```

#### 1.1 Public Ledger State Schema (`export ledger ...`)

The on-chain ledger state stores public commitments, current auction status, and the prevailing winning bid:

| Field | Type | Description |
| :--- | :--- | :--- |
| `seller` | `Bytes<32>` | Public key/identifier of the auction creator (seller). |
| `propertyId` | `Bytes<32>` | Unique asset/property identifier undergoing auction. |
| `minReservePrice` | `Uint<64>` | Minimum acceptable valuation required to be a valid bid. |
| `state` | `AuctionState` | Current phase (`AuctionState.Bidding = 0`, `Revealing = 1`, `Finalized = 2`). |
| `highestBid` | `Uint<64>` | Value of the highest valid bid revealed so far (initially `0`). |
| `winningBidder` | `Bytes<32>` | Address/public key of the current highest bidder (initialized to `seller`). |
| `bidCommitments` | `Map<Bytes<32>, Bytes<32>>` | Key-value store mapping `bidderPk` to their cryptographic commitment `persistentHash(BidCommitment)`. |

#### 1.2 Private State & Witness Specification

Off-chain bidders maintain private state containing their unhashed bid information:

```typescript
export interface BidCommitment {
  bidderPk: Uint8Array; // 32-byte public key
  bidAmount: bigint;     // uint64 bid amount
  salt: Uint8Array;      // 32-byte cryptographic entropy
}
```

* **Witness Function**: `witness getBidDetails(): BidCommitment`
  * **Execution**: Executed off-chain inside the bidder's client zero-knowledge prover runtime.
  * **Function**: Supplies the bidder's private valuation and salt to the ZK circuit.
  * **Runtime Return**: Returns a 2-tuple `[nextPrivateState, BidCommitment]`.
  * **Security Considerations**: The salt prevents rainbow table attacks and pre-image recovery when commitments are published on-chain. Private state is held strictly client-side and never broadcast without zero-knowledge encapsulation.

#### 1.3 Available Zero-Knowledge Circuits

1. **`constructor(sellerPk: Bytes<32>, propertyIdentifier: Bytes<32>, reservePrice: Uint<64>)`**
   * Initializes public ledger state.
   * `sellerPk`, `propertyIdentifier`, and `reservePrice` are wrapped in `disclose(...)` to post to the public ledger.
   * Sets `state = AuctionState.Bidding`, `highestBid = 0`, `winningBidder = sellerPk`.

2. **`submitBid(bidderId: Bytes<32>, commitment: Bytes<32>): []`**
   * Inserts the caller's commitment into `bidCommitments`.
   * **Assertions**:
     * `state == AuctionState.Bidding` ("Auction is not in Bidding phase").

3. **`closeBidding(): []`**
   * Advances the auction phase from `Bidding` to `Revealing`.
   * **Assertions**:
     * `state == AuctionState.Bidding` ("Auction is not in Bidding phase").

4. **`revealBid(bidderId: Bytes<32>): []`**
   * Queries `getBidDetails()` from the private witness.
   * Computes `persistentHash<BidCommitment>(bid)` inside the ZK circuit.
   * Compares the computed hash against `bidCommitments.lookup(bidderId)`.
   * Verifies the bid meets or exceeds `minReservePrice`.
   * Updates `highestBid` and `winningBidder` if `bid.bidAmount > highestBid`.
   * **Assertions**:
     * `state == AuctionState.Revealing` ("Auction is not in Revealing phase").
     * `registeredCommitment == computedCommitment` ("Commitment hash mismatch").
     * `bid.bidderPk == bidderId` ("Bidder ID mismatch").
     * `bid.bidAmount >= minReservePrice` ("Bid below reserve price").

5. **`finalizeAuction(): []`**
   * Closes the auction permanently, fixing `winningBidder` and `highestBid`.
   * **Assertions**:
     * `state == AuctionState.Revealing` ("Auction must be in Revealing phase").

---

### 2. Prerequisites & Installation

Add the required runtime and Compact dependencies to your `package.json`:

```bash
npm install @midnight-ntwrk/compact-runtime
```

Ensure your TypeScript configuration (`tsconfig.json`) supports ESNext modules and Node resolution:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

### 3. API Reference

#### `ConfidentialSealedBidRealestateAuctionsClient` Class

```typescript
class ConfidentialSealedBidRealestateAuctionsClient<PS = ConfidentialSealedBidRealestateAuctionsPrivateState>
```

##### Constructor
* `constructor(witnesses: ConfidentialSealedBidRealestateAuctionsWitnesses<PS>)`
  * Creates an SDK client instance wired to the user's private witness provider.

##### State Initialization
* `initialState(context: ConstructorContext<PS>): ConstructorResult<PS>`
  * Executes the contract constructor and returns the initial ledger and private state.

##### Circuit Methods
* `submitBid(context: CircuitContext<PS>, bidderId: Uint8Array, commitment: Uint8Array): CircuitResults<PS, []>`
  * Commits a sealed bid hash.
* `closeBidding(context: CircuitContext<PS>): CircuitResults<PS, []>`
  * Transitions auction to the reveal phase.
* `revealBid(context: CircuitContext<PS>, bidderId: Uint8Array): CircuitResults<PS, []>`
  * Privately proves validity of the submitted commitment and updates the leading bid.
* `finalizeAuction(context: CircuitContext<PS>): CircuitResults<PS, []>`
  * Completes the auction.

##### Ledger Query Helpers
* `queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): ConfidentialSealedBidRealestateAuctionsLedgerState`
  * Decodes raw on-chain state into a structured TypeScript object.

---

### 4. Step-by-Step Quickstart & Usage Walkthrough

The following script simulates an end-to-end sealed-bid auction lifecycle:

```typescript
/**
 * Quickstart Example: ConfidentialSealedBidRealestateAuctions Client SDK
 *
 * How to run:
 *   npx tsx examples/confidential-sealed-bid-realestate-auctions-example.ts
 */

import {
  createConstructorContext,
  createCircuitContext,
  type StateValue,
  type ChargedState,
} from '@midnight-ntwrk/compact-runtime';
import {
  ConfidentialSealedBidRealestateAuctionsClient,
  AuctionState,
  type ConfidentialSealedBidRealestateAuctionsPrivateState,
  type BidCommitment,
} from '../src/client/confidential-sealed-bid-realestate-auctions-sdk.js';

// Helper for 32-byte hex arrays
function createBytes32(fillByte: number): Uint8Array {
  const bytes = new Uint8Array(32);
  bytes.fill(fillByte);
  return bytes;
}

async function runAuctionSimulation() {
  console.log('=== Starting Real Estate Sealed-Bid Auction Simulation ===\n');

  // 1. Setup Mock Identities and Addresses
  const sellerPk = createBytes32(0xaa);
  const propertyId = createBytes32(0x99);
  const reservePrice = 500_000n; // $500,000 reserve

  const bidderPk = createBytes32(0x01);
  const bidderBidAmount = 750_000n; // $750,000 bid
  const bidderSalt = createBytes32(0x77);

  const coinPublicKey = '01'.repeat(32);
  const contractAddress = '00'.repeat(32);

  // 2. Setup Private State & Witness Providers
  let bidderPrivateState: ConfidentialSealedBidRealestateAuctionsPrivateState = {
    bidCommitment: {
      bidderPk,
      bidAmount: bidderBidAmount,
      salt: bidderSalt,
    },
  };

  const client = new ConfidentialSealedBidRealestateAuctionsClient({
    getBidDetails: (context) => {
      if (!context.privateState.bidCommitment) {
        throw new Error('No private bid details found in private state');
      }
      return [context.privateState, context.privateState.bidCommitment];
    },
  });

  // 3. Initialize Contract
  console.log('Deploying contract and setting initial state...');
  const constructorCtx = createConstructorContext(
    bidderPrivateState,
    coinPublicKey
  );
  const initResult = client.initialState(constructorCtx);

  let currentChargedState: StateValue | ChargedState =
    initResult.currentContractState.data;
  bidderPrivateState = initResult.currentPrivateState;

  let ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Initial Auction State:', {
    minReservePrice: ledgerState.minReservePrice.toString(),
    state: AuctionState[ledgerState.state],
    highestBid: ledgerState.highestBid.toString(),
  });

  // 4. Bidder Submits Sealed Bid Commitment
  console.log('\nSubmitting sealed bid commitment...');
  // Mock commitment: In production, hash matches persistentHash<BidCommitment>(bid)
  const mockCommitment = createBytes32(0x55);

  let circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const submitBidResult = client.submitBid(
    circuitCtx,
    bidderPk,
    mockCommitment
  );
  currentChargedState = submitBidResult.context.currentQueryContext.state;
  bidderPrivateState = submitBidResult.context.privateState;
  console.log('Bid commitment successfully registered.');

  // 5. Seller Closes Bidding Phase
  console.log('\nClosing bidding phase...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const closeBiddingResult = client.closeBidding(circuitCtx);
  currentChargedState = closeBiddingResult.context.currentQueryContext.state;
  bidderPrivateState = closeBiddingResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Current Auction State:', AuctionState[ledgerState.state]);

  // 6. Seller Finalizes Auction
  console.log('\nFinalizing auction...');
  circuitCtx = createCircuitContext(
    contractAddress,
    coinPublicKey,
    currentChargedState,
    bidderPrivateState
  );

  const finalizeResult = client.finalizeAuction(circuitCtx);
  currentChargedState = finalizeResult.context.currentQueryContext.state;
  bidderPrivateState = finalizeResult.context.privateState;

  ledgerState = client.queryLedgerStateFromRaw(currentChargedState);
  console.log('Final Auction State:', AuctionState[ledgerState.state]);
  console.log('Winning Bidder:', Buffer.from(ledgerState.winningBidder).toString('hex'));
  console.log('Highest Bid:', ledgerState.highestBid.toString());

  console.log('\n=== Simulation Completed Successfully ===');
}

runAuctionSimulation().catch(console.error);
```

---

### 5. Privacy & Security Notes

1. **Commitment Uniqueness & Salt Entropy**:
   * Every bid MUST use a cryptographically strong, randomly generated 32-byte `salt`.
   * Reusing salts across bids or contracts allows brute-force dictionary attacks against common bid valuations.

2. **Off-Chain Private State Handling**:
   * Private state objects containing `BidCommitment` must be stored securely (e.g., encrypted browser storage or hardware-backed stores) between the `submitBid` and `revealBid` transactions.

3. **Selective Disclosure**:
   * Calling `revealBid` discloses the winning bid amount and bidder public key on-chain if and only if the bid exceeds previous bids. Losing bids that do not exceed the winning bid remain confidential.

---

## Part 2: Production TypeScript Client SDK Implementation

```typescript
/**
 * Confidential Sealed-Bid Real Estate Auctions Client SDK
 *
 * Provides strongly-typed zero-knowledge circuit bindings, ledger decoding,
 * and witness providers for confidential-sealed-bid-realestate-auctions.compact.
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
} from '../../contracts/managed/confidential-sealed-bid-realestate-auctions/contract/index.js';

/**
 * Enumeration representing the phases of the auction.
 */
export enum AuctionState {
  Bidding = 0,
  Revealing = 1,
  Finalized = 2,
}

/**
 * Representation of a private bid commitment structure.
 */
export interface BidCommitment {
  /** 32-byte public key of the bidder */
  bidderPk: Uint8Array;
  /** Unsigned 64-bit integer bid value */
  bidAmount: bigint;
  /** 32-byte cryptographic random salt */
  salt: Uint8Array;
}

/**
 * Private off-chain state retained locally by the bidder.
 */
export interface ConfidentialSealedBidRealestateAuctionsPrivateState {
  /** Optional stored active bid details */
  readonly bidCommitment?: BidCommitment;
  /** Optional extensible arbitrary private storage */
  readonly [key: string]: unknown;
}

/**
 * Ledger state projection for the auction contract.
 */
export type ConfidentialSealedBidRealestateAuctionsLedgerState = ContractLedger;

/**
 * Strongly-typed witness providers required by the auction circuit runtime.
 */
export interface ConfidentialSealedBidRealestateAuctionsWitnesses<
  PS extends ConfidentialSealedBidRealestateAuctionsPrivateState = ConfidentialSealedBidRealestateAuctionsPrivateState,
> {
  /**
   * Retrieves the bidder's private bid parameters to construct the ZK reveal proof.
   *
   * @param context - The execution witness context including local private state.
   * @returns A 2-element tuple of `[nextPrivateState, BidCommitment]`.
   */
  getBidDetails: (
    context: WitnessContext<ContractLedger, PS>
  ) => [PS, BidCommitment] | Promise<[PS, BidCommitment]>;
}

/**
 * Production-grade Client SDK for the Confidential Sealed-Bid Real Estate Auction smart contract.
 */
export class ConfidentialSealedBidRealestateAuctionsClient<
  PS extends ConfidentialSealedBidRealestateAuctionsPrivateState = ConfidentialSealedBidRealestateAuctionsPrivateState,
> {
  /** Underlying managed contract instance */
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs a new auction client instance.
   *
   * @param witnesses - Implementation of off-chain witness functions.
   */
  constructor(witnesses: ConfidentialSealedBidRealestateAuctionsWitnesses<PS>) {
    // Map SDK witness interface to runtime expected witnesses
    const contractWitnesses: ContractWitnesses<PS> = {
      getBidDetails: (context: WitnessContext<ContractLedger, PS>) => {
        return witnesses.getBidDetails(context);
      },
    };

    this.contract = new ManagedContract<PS>(contractWitnesses);
  }

  /**
   * Initializes the contract state via the constructor context.
   *
   * @param context - The constructor context containing initial private state and deployment keys.
   * @returns Constructor execution result with initial contract and private states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Submits a sealed-bid commitment to the auction ledger during the Bidding phase.
   *
   * @param context - Circuit execution context.
   * @param bidderId - 32-byte identifier/public key of the bidder.
   * @param commitment - 32-byte persistent hash of the BidCommitment.
   * @returns Circuit execution result with unit return value `[]`.
   */
  public submitBid(
    context: CircuitContext<PS>,
    bidderId: Uint8Array,
    commitment: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.submitBid(context, bidderId, commitment);
  }

  /**
   * Closes the bidding phase and transitions the auction to the Revealing phase.
   *
   * @param context - Circuit execution context.
   * @returns Circuit execution result with unit return value `[]`.
   */
  public closeBidding(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.closeBidding(context);
  }

  /**
   * Proves the validity of a submitted commitment in zero-knowledge and reveals the bid.
   * If the revealed bid exceeds the current highest bid, the winning bidder is updated.
   *
   * @param context - Circuit execution context.
   * @param bidderId - 32-byte identifier/public key of the bidder.
   * @returns Circuit execution result with unit return value `[]`.
   */
  public revealBid(
    context: CircuitContext<PS>,
    bidderId: Uint8Array
  ): CircuitResults<PS, []> {
    return this.contract.circuits.revealBid(context, bidderId);
  }

  /**
   * Finalizes the auction once all bids have been revealed, locking in the winner.
   *
   * @param context - Circuit execution context.
   * @returns Circuit execution result with unit return value `[]`.
   */
  public finalizeAuction(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.finalizeAuction(context);
  }

  /**
   * Decodes and parses raw contract state into typed public ledger state.
   *
   * @param rawState - Raw ledger state or charged state representation.
   * @returns Typed `ConfidentialSealedBidRealestateAuctionsLedgerState`.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): ConfidentialSealedBidRealestateAuctionsLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}
```