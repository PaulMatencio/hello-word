/**
 * Bulletin Board Midnight Compact Client SDK
 * File: src/client/bulletin-board-sdk.ts
 *
 * Strongly-typed SDK adapter for the bulletin-board Compact smart contract.
 */

import {
  type CircuitContext,
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
 * Base interface representing the private state required for the Bulletin Board.
 */
export interface BulletinBoardPrivateState {
  /** 32-byte private key used to prove ownership of posts */
  readonly secretKey: Uint8Array;
}

/**
 * Strongly-typed witnesses interface matching Compact witness signatures.
 * Each witness returns a 2-element tuple of [NextPrivateState, ReturnValue].
 */
export interface BulletinBoardWitnesses<PS extends BulletinBoardPrivateState> {
  localSecretKey: (
    context: WitnessContext<ContractLedger, PS>
  ) => [PS, Uint8Array];
}

/**
 * Ledger state type alias mapping directly to the contract's public state schema.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Production client SDK for interacting with the Bulletin Board Compact contract.
 */
export class BulletinBoardClient<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Initializes the client with optional witness function overrides.
   *
   * @param witnesses - Optional custom witness implementations.
   */
  constructor(witnesses?: Partial<BulletinBoardWitnesses<PS>>) {
    const defaultWitnesses: ContractWitnesses<PS> = {
      localSecretKey: (
        context: WitnessContext<ContractLedger, PS>
      ): [PS, Uint8Array] => {
        const sk = context.privateState.secretKey;
        if (!sk || sk.length !== 32) {
          throw new Error(
            'Invalid private state: `secretKey` must be a defined Uint8Array of exactly 32 bytes.'
          );
        }
        return [context.privateState, sk];
      },
      ...witnesses,
    };

    this.contract = new ManagedContract<PS>(defaultWitnesses);
  }

  /**
   * Initializes the contract state using the Compact constructor context.
   *
   * @param context - Constructor execution context.
   * @returns The initial contract, private, and ZSwap states.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Posts a new message to the bulletin board.
   * Requires the board to be in the VACANT state.
   *
   * @param context - The current circuit execution context.
   * @param message - The text message to post.
   * @returns Circuit results with empty tuple `[]` return value.
   */
  public post(
    context: CircuitContext<PS>,
    message: string
  ): CircuitResults<PS, []> {
    return this.contract.circuits.post(context, message);
  }

  /**
   * Takes down the current message on the bulletin board.
   * Requires the board to be OCCUPIED and the caller to be the post owner.
   *
   * @param context - The current circuit execution context.
   * @returns Circuit results containing the previous message string.
   */
  public takeDown(
    context: CircuitContext<PS>
  ): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Computes the deterministic owner commitment hash for a given secret key and sequence.
   *
   * @param context - The current circuit execution context.
   * @param sk - 32-byte secret key.
   * @param sequence - 32-byte sequence representation.
   * @returns Circuit results containing the 32-byte public key hash.
   */
  public getPublicKey(
    context: CircuitContext<PS>,
    sk: Uint8Array,
    sequence: Uint8Array
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.publicKey(context, sk, sequence);
  }

  /**
   * Helper utility to decode raw ledger state data into the strongly typed ContractLedger schema.
   *
   * @param rawState - The raw state value or charged state from Midnight runtime.
   * @returns The decoded BulletinBoardLedgerState.
   */
  public queryLedgerStateFromRaw(
    rawState: StateValue | ChargedState | unknown
  ): BulletinBoardLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}