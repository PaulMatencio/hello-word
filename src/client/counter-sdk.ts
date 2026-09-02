/**
 * Production Client SDK for the Midnight Counter Smart Contract.
 *
 * Implements typed circuit invocation, state decoding, and context management
 * adhering strictly to Compact language (>= 0.23) and Midnight.js runtime standards.
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
} from '../../contracts/managed/counter/contract/index.js';

/**
 * Default Private State representation for the Counter contract.
 * Can be extended by consumer applications requiring persistent local storage.
 */
export interface CounterPrivateState {
  readonly [key: string]: unknown;
}

/**
 * Typed Witness interface for the Counter contract.
 * Each witness accepts a WitnessContext and returns a tuple of [nextPrivateState, value].
 */
export type CounterWitnesses<PS = CounterPrivateState> = ContractWitnesses<PS>;

/**
 * Public Ledger State structure for the Counter contract.
 */
export type CounterLedgerState = ContractLedger;

/**
 * Production-ready TypeScript Client SDK for interacting with the Counter contract.
 */
export class CounterClient<PS = CounterPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new instance of CounterClient.
   *
   * @param witnesses - Optional witness implementations. Defaults to an empty object if no witnesses are required.
   */
  constructor(witnesses: CounterWitnesses<PS> = {} as CounterWitnesses<PS>) {
    this.contract = new ManagedContract<PS>(witnesses);
  }

  /**
   * Generates the initial contract state transition via the contract constructor.
   *
   * @param context - The constructor context containing initial private state and deployment keys.
   * @returns ConstructorResult containing the genesis contract state and updated private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `increment` zero-knowledge circuit.
   *
   * @param context - Circuit execution context containing current charged state and private state.
   * @param by - The positive numeric amount by which to increment the on-chain counter.
   * @returns CircuitResults containing execution context updates, query context, and return tuple [].
   */
  public increment(
    context: CircuitContext<PS>,
    by: number
  ): CircuitResults<PS, []> {
    if (by <= 0) {
      throw new Error(
        'Client-side validation error: Increment step must be greater than zero'
      );
    }
    return this.contract.circuits.increment(context, by);
  }

  /**
   * Executes the `reset` zero-knowledge circuit.
   *
   * @param context - Circuit execution context containing current charged state and private state.
   * @returns CircuitResults containing execution context updates, query context, and return tuple [].
   */
  public reset(context: CircuitContext<PS>): CircuitResults<PS, []> {
    return this.contract.circuits.reset(context);
  }

  /**
   * Parses and decodes raw ledger state bytes or query context charged state into typed CounterLedgerState.
   *
   * @param rawState - The raw StateValue or ChargedState obtained from on-chain queries or circuit contexts.
   * @returns Strongly-typed CounterLedgerState (e.g. `{ count: number }`).
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): CounterLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}