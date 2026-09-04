import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             initNonce_0: Uint8Array,
             name__0: string,
             symbol__0: string,
             decimals__0: bigint,
             domain__0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  name(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  symbol(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  decimals(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  tokenType(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  totalSupply(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       recipient_0: { is_left: boolean,
                      left: { bytes: Uint8Array },
                      right: { bytes: Uint8Array }
                    },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { nonce: Uint8Array,
                                                                color: Uint8Array,
                                                                value: bigint
                                                              }>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { change: { is_some: boolean,
                                                                          value: { nonce: Uint8Array,
                                                                                   color: Uint8Array,
                                                                                   value: bigint
                                                                                 }
                                                                        },
                                                                sent: { nonce: Uint8Array,
                                                                        color: Uint8Array,
                                                                        value: bigint
                                                                      }
                                                              }>;
}

export type ProvableCircuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             initNonce_0: Uint8Array,
             name__0: string,
             symbol__0: string,
             decimals__0: bigint,
             domain__0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  name(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  symbol(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  decimals(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  tokenType(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  totalSupply(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       recipient_0: { is_left: boolean,
                      left: { bytes: Uint8Array },
                      right: { bytes: Uint8Array }
                    },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { nonce: Uint8Array,
                                                                color: Uint8Array,
                                                                value: bigint
                                                              }>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { change: { is_some: boolean,
                                                                          value: { nonce: Uint8Array,
                                                                                   color: Uint8Array,
                                                                                   value: bigint
                                                                                 }
                                                                        },
                                                                sent: { nonce: Uint8Array,
                                                                        color: Uint8Array,
                                                                        value: bigint
                                                                      }
                                                              }>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initialize(context: __compactRuntime.CircuitContext<PS>,
             initNonce_0: Uint8Array,
             name__0: string,
             symbol__0: string,
             decimals__0: bigint,
             domain__0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  name(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  symbol(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, string>;
  decimals(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  tokenType(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
  totalSupply(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       recipient_0: { is_left: boolean,
                      left: { bytes: Uint8Array },
                      right: { bytes: Uint8Array }
                    },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { nonce: Uint8Array,
                                                                color: Uint8Array,
                                                                value: bigint
                                                              }>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       coin_0: { nonce: Uint8Array, color: Uint8Array, value: bigint },
       amount_0: bigint): __compactRuntime.CircuitResults<PS, { change: { is_some: boolean,
                                                                          value: { nonce: Uint8Array,
                                                                                   color: Uint8Array,
                                                                                   value: bigint
                                                                                 }
                                                                        },
                                                                sent: { nonce: Uint8Array,
                                                                        color: Uint8Array,
                                                                        value: bigint
                                                                      }
                                                              }>;
}

export type Ledger = {
  readonly _counter: bigint;
  readonly _nonce: Uint8Array;
  readonly _totalSupply: bigint;
  readonly _domain: Uint8Array;
  readonly _name: string;
  readonly _symbol: string;
  readonly _decimals: bigint;
  readonly _type: Uint8Array;
  readonly _isInitialized: boolean;
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
