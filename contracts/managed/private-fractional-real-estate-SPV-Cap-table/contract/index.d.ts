import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type ShareHolding = { ownerPk: Uint8Array;
                             amount: bigint;
                             salt: Uint8Array
                           };

export type NullifierData = { commitment: Uint8Array; secretKey: Uint8Array };

export type TransferOutput = { recipientCommitment: Uint8Array;
                               changeCommitment: Uint8Array
                             };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  issueShares(context: __compactRuntime.CircuitContext<PS>,
              managerSk_0: Uint8Array,
              investorPk_0: Uint8Array,
              amount_0: bigint,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  transferShares(context: __compactRuntime.CircuitContext<PS>,
                 senderSk_0: Uint8Array,
                 currentAmount_0: bigint,
                 currentSalt_0: Uint8Array,
                 transferAmount_0: bigint,
                 recipientPk_0: Uint8Array,
                 recipientSalt_0: Uint8Array,
                 changeSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, TransferOutput>;
  proveShareThreshold(context: __compactRuntime.CircuitContext<PS>,
                      ownerSk_0: Uint8Array,
                      amount_0: bigint,
                      salt_0: Uint8Array,
                      threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  issueShares(context: __compactRuntime.CircuitContext<PS>,
              managerSk_0: Uint8Array,
              investorPk_0: Uint8Array,
              amount_0: bigint,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  transferShares(context: __compactRuntime.CircuitContext<PS>,
                 senderSk_0: Uint8Array,
                 currentAmount_0: bigint,
                 currentSalt_0: Uint8Array,
                 transferAmount_0: bigint,
                 recipientPk_0: Uint8Array,
                 recipientSalt_0: Uint8Array,
                 changeSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, TransferOutput>;
  proveShareThreshold(context: __compactRuntime.CircuitContext<PS>,
                      ownerSk_0: Uint8Array,
                      amount_0: bigint,
                      salt_0: Uint8Array,
                      threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  issueShares(context: __compactRuntime.CircuitContext<PS>,
              managerSk_0: Uint8Array,
              investorPk_0: Uint8Array,
              amount_0: bigint,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  transferShares(context: __compactRuntime.CircuitContext<PS>,
                 senderSk_0: Uint8Array,
                 currentAmount_0: bigint,
                 currentSalt_0: Uint8Array,
                 transferAmount_0: bigint,
                 recipientPk_0: Uint8Array,
                 recipientSalt_0: Uint8Array,
                 changeSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, TransferOutput>;
  proveShareThreshold(context: __compactRuntime.CircuitContext<PS>,
                      ownerSk_0: Uint8Array,
                      amount_0: bigint,
                      salt_0: Uint8Array,
                      threshold_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly manager: Uint8Array;
  readonly propertyId: Uint8Array;
  readonly totalAuthorizedShares: bigint;
  readonly totalIssuedShares: bigint;
  commitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
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
               initialManager_0: Uint8Array,
               initialPropertyId_0: Uint8Array,
               authorizedShares_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
