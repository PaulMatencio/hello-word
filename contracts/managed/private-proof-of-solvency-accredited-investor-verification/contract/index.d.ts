import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getInvestorData(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { investorSecret: Uint8Array,
                                                                                investorId: Uint8Array
                                                                              }];
  getAttestation(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { auditor: Uint8Array,
                                                                               investorCommitment: Uint8Array,
                                                                               netWorth: bigint,
                                                                               expiry: bigint,
                                                                               attestationSalt: Uint8Array
                                                                             }];
}

export type ImpureCircuits<PS> = {
  registerAuditor(context: __compactRuntime.CircuitContext<PS>,
                  auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditor(context: __compactRuntime.CircuitContext<PS>,
                auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateThreshold(context: __compactRuntime.CircuitContext<PS>,
                  newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveSolvencyAndAccreditation(context: __compactRuntime.CircuitContext<PS>,
                                campaignId_0: Uint8Array,
                                currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type ProvableCircuits<PS> = {
  registerAuditor(context: __compactRuntime.CircuitContext<PS>,
                  auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditor(context: __compactRuntime.CircuitContext<PS>,
                auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateThreshold(context: __compactRuntime.CircuitContext<PS>,
                  newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveSolvencyAndAccreditation(context: __compactRuntime.CircuitContext<PS>,
                                campaignId_0: Uint8Array,
                                currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerAuditor(context: __compactRuntime.CircuitContext<PS>,
                  auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAuditor(context: __compactRuntime.CircuitContext<PS>,
                auditor_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateThreshold(context: __compactRuntime.CircuitContext<PS>,
                  newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  proveSolvencyAndAccreditation(context: __compactRuntime.CircuitContext<PS>,
                                campaignId_0: Uint8Array,
                                currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly authority: Uint8Array;
  readonly minSolvencyThreshold: bigint;
  registeredAuditors: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly totalVerifications: bigint;
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
               admin_0: Uint8Array,
               initialThreshold_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
