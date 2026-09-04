import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Identity_UserSecretKey = { bytes: Uint8Array };

export type Identity_AdminPublicKey = { bytes: Uint8Array };

export type Witnesses<PS> = {
  getUserSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Identity_UserSecretKey];
}

export type ImpureCircuits<PS> = {
  owner(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Identity_AdminPublicKey>;
  transferOwnership(context: __compactRuntime.CircuitContext<PS>,
                    newOwner_0: Identity_AdminPublicKey): __compactRuntime.CircuitResults<PS, []>;
  renounceOwnership(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  setVaultConfig(context: __compactRuntime.CircuitContext<PS>,
                 newConfig_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getVaultConfig(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  deposit(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  owner(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Identity_AdminPublicKey>;
  transferOwnership(context: __compactRuntime.CircuitContext<PS>,
                    newOwner_0: Identity_AdminPublicKey): __compactRuntime.CircuitResults<PS, []>;
  renounceOwnership(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  setVaultConfig(context: __compactRuntime.CircuitContext<PS>,
                 newConfig_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getVaultConfig(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  deposit(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  Identity_deriveAdminPublicKey(sk_0: Identity_UserSecretKey): Identity_AdminPublicKey;
}

export type Circuits<PS> = {
  Identity_deriveAdminPublicKey(context: __compactRuntime.CircuitContext<PS>,
                                sk_0: Identity_UserSecretKey): __compactRuntime.CircuitResults<PS, Identity_AdminPublicKey>;
  owner(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Identity_AdminPublicKey>;
  transferOwnership(context: __compactRuntime.CircuitContext<PS>,
                    newOwner_0: Identity_AdminPublicKey): __compactRuntime.CircuitResults<PS, []>;
  renounceOwnership(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  setVaultConfig(context: __compactRuntime.CircuitContext<PS>,
                 newConfig_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getVaultConfig(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  deposit(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>, amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly Ownable__owner: Identity_AdminPublicKey;
  readonly vaultBalance: bigint;
  readonly vaultConfigValue: bigint;
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
               initialConfig_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
