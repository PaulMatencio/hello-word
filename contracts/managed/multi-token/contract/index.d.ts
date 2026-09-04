import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Maybe<T> = { is_some: boolean; value: T };

export type MultiToken_UserSecretKey = { bytes: Uint8Array };

export type MultiToken_UserPublicKey = { bytes: Uint8Array };

export type MultiToken_AdminPublicKey = { bytes: Uint8Array };

export type Witnesses<PS> = {
  getUserSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, MultiToken_UserSecretKey];
}

export type ImpureCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, _uri_2: string): __compactRuntime.CircuitResults<PS, []>;
  uri(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, string>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>,
            account_0: MultiToken_UserPublicKey,
            id_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  isApprovedForAll(context: __compactRuntime.CircuitContext<PS>,
                   account_0: MultiToken_UserPublicKey,
                   operator_0: MultiToken_UserPublicKey): __compactRuntime.CircuitResults<PS, boolean>;
  setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                    operator_0: MultiToken_UserPublicKey,
                    approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           to_0: MultiToken_UserPublicKey,
           id_0: bigint,
           value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transferFromAuthorized(context: __compactRuntime.CircuitContext<PS>,
                         fromAddress_0: MultiToken_UserPublicKey,
                         to_0: MultiToken_UserPublicKey,
                         id_0: bigint,
                         value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _transfer(context: __compactRuntime.CircuitContext<PS>,
            fromAddress_0: MultiToken_UserPublicKey,
            to_0: MultiToken_UserPublicKey,
            id_0: bigint,
            value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setURI(context: __compactRuntime.CircuitContext<PS>, newURI_0: string): __compactRuntime.CircuitResults<PS, []>;
  _mint(context: __compactRuntime.CircuitContext<PS>,
        to_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _burn(context: __compactRuntime.CircuitContext<PS>,
        fromAddress_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                     owner_0: MultiToken_UserPublicKey,
                     operator_0: MultiToken_UserPublicKey,
                     approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>, _uri_2: string): __compactRuntime.CircuitResults<PS, []>;
  uri(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, string>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>,
            account_0: MultiToken_UserPublicKey,
            id_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  isApprovedForAll(context: __compactRuntime.CircuitContext<PS>,
                   account_0: MultiToken_UserPublicKey,
                   operator_0: MultiToken_UserPublicKey): __compactRuntime.CircuitResults<PS, boolean>;
  setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                    operator_0: MultiToken_UserPublicKey,
                    approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           to_0: MultiToken_UserPublicKey,
           id_0: bigint,
           value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transferFromAuthorized(context: __compactRuntime.CircuitContext<PS>,
                         fromAddress_0: MultiToken_UserPublicKey,
                         to_0: MultiToken_UserPublicKey,
                         id_0: bigint,
                         value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _transfer(context: __compactRuntime.CircuitContext<PS>,
            fromAddress_0: MultiToken_UserPublicKey,
            to_0: MultiToken_UserPublicKey,
            id_0: bigint,
            value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setURI(context: __compactRuntime.CircuitContext<PS>, newURI_0: string): __compactRuntime.CircuitResults<PS, []>;
  _mint(context: __compactRuntime.CircuitContext<PS>,
        to_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _burn(context: __compactRuntime.CircuitContext<PS>,
        fromAddress_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                     owner_0: MultiToken_UserPublicKey,
                     operator_0: MultiToken_UserPublicKey,
                     approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  MultiToken_deriveUserPublicKey(sk_0: MultiToken_UserSecretKey): MultiToken_UserPublicKey;
  MultiToken_deriveAdminPublicKey(sk_0: MultiToken_UserSecretKey): MultiToken_AdminPublicKey;
}

export type Circuits<PS> = {
  MultiToken_deriveUserPublicKey(context: __compactRuntime.CircuitContext<PS>,
                                 sk_0: MultiToken_UserSecretKey): __compactRuntime.CircuitResults<PS, MultiToken_UserPublicKey>;
  MultiToken_deriveAdminPublicKey(context: __compactRuntime.CircuitContext<PS>,
                                  sk_0: MultiToken_UserSecretKey): __compactRuntime.CircuitResults<PS, MultiToken_AdminPublicKey>;
  initialize(context: __compactRuntime.CircuitContext<PS>, _uri_2: string): __compactRuntime.CircuitResults<PS, []>;
  uri(context: __compactRuntime.CircuitContext<PS>, id_0: bigint): __compactRuntime.CircuitResults<PS, string>;
  balanceOf(context: __compactRuntime.CircuitContext<PS>,
            account_0: MultiToken_UserPublicKey,
            id_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  isApprovedForAll(context: __compactRuntime.CircuitContext<PS>,
                   account_0: MultiToken_UserPublicKey,
                   operator_0: MultiToken_UserPublicKey): __compactRuntime.CircuitResults<PS, boolean>;
  setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                    operator_0: MultiToken_UserPublicKey,
                    approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           to_0: MultiToken_UserPublicKey,
           id_0: bigint,
           value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  transferFromAuthorized(context: __compactRuntime.CircuitContext<PS>,
                         fromAddress_0: MultiToken_UserPublicKey,
                         to_0: MultiToken_UserPublicKey,
                         id_0: bigint,
                         value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _transfer(context: __compactRuntime.CircuitContext<PS>,
            fromAddress_0: MultiToken_UserPublicKey,
            to_0: MultiToken_UserPublicKey,
            id_0: bigint,
            value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setURI(context: __compactRuntime.CircuitContext<PS>, newURI_0: string): __compactRuntime.CircuitResults<PS, []>;
  _mint(context: __compactRuntime.CircuitContext<PS>,
        to_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _burn(context: __compactRuntime.CircuitContext<PS>,
        fromAddress_0: MultiToken_UserPublicKey,
        id_0: bigint,
        value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  _setApprovalForAll(context: __compactRuntime.CircuitContext<PS>,
                     owner_0: MultiToken_UserPublicKey,
                     operator_0: MultiToken_UserPublicKey,
                     approved_0: boolean): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  MultiToken__balances: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): {
      isEmpty(): boolean;
      size(): bigint;
      member(key_1: MultiToken_UserPublicKey): boolean;
      lookup(key_1: MultiToken_UserPublicKey): bigint;
      [Symbol.iterator](): Iterator<[MultiToken_UserPublicKey, bigint]>
    }
  };
  MultiToken__operatorApprovals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: MultiToken_UserPublicKey): boolean;
    lookup(key_0: MultiToken_UserPublicKey): {
      isEmpty(): boolean;
      size(): bigint;
      member(key_1: MultiToken_UserPublicKey): boolean;
      lookup(key_1: MultiToken_UserPublicKey): boolean;
      [Symbol.iterator](): Iterator<[MultiToken_UserPublicKey, boolean]>
    }
  };
  readonly MultiToken__uri: string;
  readonly contractAdmin: MultiToken_AdminPublicKey;
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
               _uri_2: Maybe<string>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
