/**
 * Production-grade TypeScript Client SDK for the Midnight `hello-world` smart contract.
 *
 * Contract: hello-world.compact
 * Language Version: >= 0.23
 */

import {
  type CircuitContext,
  type QueryContext,
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
} from '../../contracts/managed/hello-world/contract/index.js';

/**
 * Interface representing the off-chain private state for the Hello World contract.
 */
export interface HelloWorldPrivateState {
  readonly [key: string]: unknown;
}

/**
 * Type mapping for contract witnesses.
 * Witness functions must return a 2-element tuple of [NextPrivateState, ReturnValue].
 */
export type HelloWorldWitnesses<PS = HelloWorldPrivateState> = ContractWitnesses<PS>;

/**
 * Strongly-typed representation of the Hello World on-chain ledger state.
 */
export type HelloWorldLedgerState = ContractLedger;

/**
 * High-level, production-ready client adapter for interacting with the Hello World smart contract.
 */
export class HelloWorldClient<PS extends HelloWorldPrivateState = HelloWorldPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes a new instance of the HelloWorldClient.
   *
   * @param witnesses - Optional witness implementations. Uses empty witnesses if omitted.
   * @param contractInstance - Optional pre-instantiated ManagedContract instance.
   */
  constructor(
    witnesses: HelloWorldWitnesses<PS> = {} as HelloWorldWitnesses<PS>,
    contractInstance?: ManagedContract<PS>
  ) {
    this.contract = contractInstance ?? new ManagedContract<PS>(witnesses);
  }

  /**
   * Generates the initial contract state using the provided constructor context.
   *
   * @param context - The constructor initialization context.
   * @returns The initial contract and private state bundle.
   */
  public initialState(
    context: ConstructorContext<PS>
  ): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Executes the `storeMessage` circuit to update the message stored on the ledger.
   * Note: In Compact circuits without return values, the return type is the unit empty tuple `[]`.
   *
   * @param context - The active circuit context for execution.
   * @param newMessage - The new string message to disclose and persist on-chain.
   * @returns An execution result containing the updated context and empty tuple `[]`.
   * @throws {TypeError} If newMessage is not a string.
   */
  public storeMessage(
    context: CircuitContext<PS>,
    newMessage: string
  ): CircuitResults<PS, []> {
    if (typeof newMessage !== 'string') {
      throw new TypeError(`Expected newMessage to be a string, received ${typeof newMessage}`);
    }

    return this.contract.circuits.storeMessage(context, newMessage);
  }

  /**
   * Queries and decodes the typed ledger state from an active QueryContext.
   *
   * @param context - The query context containing current ledger state.
   * @returns Strongly-typed HelloWorldLedgerState.
   */
  public queryLedgerState(context: QueryContext): HelloWorldLedgerState {
    const rawState = context.state.state;
    return this.queryLedgerStateFromRaw(rawState);
  }

  /**
   * Parses raw ledger state buffers into strongly-typed HelloWorldLedgerState.
   *
   * @param rawState - The raw ledger state byte buffer or state object.
   * @returns Strongly-typed HelloWorldLedgerState.
   */
  public queryLedgerStateFromRaw(rawState: StateValue | ChargedState | unknown): HelloWorldLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }

  /**
   * Returns the underlying ManagedContract instance.
   */
  public getContract(): ManagedContract<PS> {
    return this.contract;
  }
}