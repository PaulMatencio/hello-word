import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Identity_UserSecretKey = { bytes: Uint8Array };

export type Identity_AdminPublicKey = { bytes: Uint8Array };

export type Witnesses<PS> = {
  getUserSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Identity_UserSecretKey];
}

export type ImpureCircuits<PS> = {
  isPaused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           fromAccount_0: Uint8Array,
           to_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>, account_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  isPaused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           fromAccount_0: Uint8Array,
           to_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>, account_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
  Identity_deriveAdminPublicKey(sk_0: Identity_UserSecretKey): Identity_AdminPublicKey;
}

export type Circuits<PS> = {
  Identity_deriveAdminPublicKey(context: __compactRuntime.CircuitContext<PS>,
                                sk_0: Identity_UserSecretKey): __compactRuntime.CircuitResults<PS, Identity_AdminPublicKey>;
  isPaused(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unpause(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           fromAccount_0: Uint8Array,
           to_0: Uint8Array,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>, account_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly Pausable__isPaused: boolean;
  readonly Ownable__owner: Identity_AdminPublicKey;
  balances: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly totalSupply: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
