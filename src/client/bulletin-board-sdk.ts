/**
 * BulletinBoard Client SDK
 *
 * Production TypeScript SDK adapter for the BulletinBoard Compact smart contract.
 * Provides strongly-typed interfaces, witness configuration, context management,
 * and circuit execution wrappers.
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
} from '../../contracts/managed/bulletin-board/contract/index.js';

/**
 * Off-chain private state required by the BulletinBoard contract witnesses.
 */
export interface BulletinBoardPrivateState {
  /** 32-byte private secret key used to derive ownership tags */
  readonly secretKey: Uint8Array;
}

/**
 * Type alias for BulletinBoard ledger state representation.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Strongly-typed witness map for the BulletinBoard contract.
 * Witness functions in Compact runtime return a 2-element tuple: [PS, ReturnValue].
 */
export interface BulletinBoardWitnesses<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState>
  extends ContractWitnesses<PS> {
  localSecretKey: (context: WitnessContext<ContractLedger, PS>) => [PS, Uint8Array];
}

/**
 * Creates the default witness implementation backed by `BulletinBoardPrivateState`.
 */
export function createBulletinBoardWitnesses<
  PS extends BulletinBoardPrivateState = BulletinBoardPrivateState,
>(): BulletinBoardWitnesses<PS> {
  return {
    localSecretKey: (context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] => {
      const { privateState } = context;
      if (!privateState?.secretKey || privateState.secretKey.length !== 32) {
        throw new Error(
          'BulletinBoard Witness Error: privateState.secretKey must be a valid 32-byte Uint8Array',
        );
      }
      return [privateState, privateState.secretKey];
    },
  };
}

/**
 * High-level production SDK client for interacting with the BulletinBoard contract.
 */
export class BulletinBoardClient<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes the BulletinBoard client with optional custom witnesses.
   *
   * @param witnesses - Optional custom witnesses. Defaults to `createBulletinBoardWitnesses()`.
   */
  constructor(witnesses?: BulletinBoardWitnesses<PS>) {
    const activeWitnesses = witnesses ?? (createBulletinBoardWitnesses<PS>() as unknown as BulletinBoardWitnesses<PS>);
    this.contract = new ManagedContract<PS>(activeWitnesses);
  }

  /**
   * Computes the initial contract state for deployment/initialization.
   *
   * @param context - Constructor context containing initial private state and deployment parameters.
   * @returns The initial constructor result containing contract state and private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `postMessage` circuit.
   * Posts a new message if the board is VACANT, or updates the message if called by the current owner.
   *
   * @param context - The circuit context including contract address, coin key, current state, and private state.
   * @param newMessage - The string message to post.
   * @returns The updated circuit results containing unit return `[]` and updated context.
   */
  public postMessage(
    context: CircuitContext<PS>,
    newMessage: string,
  ): CircuitResults<PS, []> {
    if (typeof newMessage !== 'string') {
      throw new TypeError('postMessage error: newMessage must be a string');
    }
    return this.contract.circuits.postMessage(context, newMessage);
  }

  /**
   * Executes the `takeDown` circuit.
   * Clears the current post and resets the board to VACANT. Only callable by the current owner.
   *
   * @param context - The circuit context.
   * @returns The circuit results containing the former message string and updated context.
   */
  public takeDown(
    context: CircuitContext<PS>,
  ): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Alias for `postMessage` for backwards compatibility.
   */
  public post(
    context: CircuitContext<PS>,
    newMessage: string,
  ): CircuitResults<PS, []> {
    return this.postMessage(context, newMessage);
  }

  /**
   * Queries and decodes the typed ledger state from an active QueryContext, ChargedState, or StateValue.
   *
   * @param contextOrState - The query context, charged state, or raw state value.
   * @returns Strongly-typed BulletinBoardLedgerState.
   */
  public queryLedgerState(
    contextOrState: StateValue | ChargedState | QueryContext | unknown,
  ): BulletinBoardLedgerState {
    if (!contextOrState) {
      throw new Error('Cannot query ledger state from undefined or null state');
    }
    const anyState = contextOrState as any;
    if (anyState.currentQueryContext?.state) {
      return ledger(anyState.currentQueryContext.state);
    }
    if (anyState.state !== undefined && anyState.state.state !== undefined) {
      return ledger(anyState.state);
    }
    return ledger(contextOrState as StateValue | ChargedState);
  }

  /**
   * Parses and deserializes raw on-chain state data into strongly-typed `BulletinBoardLedgerState`.
   *
   * @param rawState - The raw contract state or charged state representation.
   * @returns Strongly-typed ledger state.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown,
  ): BulletinBoardLedgerState {
    return this.queryLedgerState(rawState);
  }
}