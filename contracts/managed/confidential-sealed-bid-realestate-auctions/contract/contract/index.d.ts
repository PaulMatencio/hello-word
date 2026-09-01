import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum AuctionState { Bidding = 0, Revealing = 1, Finalized = 2 }

export type BidCommitment = { bidderPk: Uint8Array;
                              bidAmount: bigint;
                              salt: Uint8Array
                            };

export type Witnesses<PS> = {
  getBidDetails(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, BidCommitment];
}

export type ImpureCircuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            bidderId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeBidding(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>, bidderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            bidderId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeBidding(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>, bidderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  submitBid(context: __compactRuntime.CircuitContext<PS>,
            bidderId_0: Uint8Array,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeBidding(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  revealBid(context: __compactRuntime.CircuitContext<PS>, bidderId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  finalizeAuction(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly seller: Uint8Array;
  readonly propertyId: Uint8Array;
  readonly minReservePrice: bigint;
  readonly state: AuctionState;
  readonly highestBid: bigint;
  readonly winningBidder: Uint8Array;
  bidCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               sellerPk_0: Uint8Array,
               propertyIdentifier_0: Uint8Array,
               reservePrice_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
