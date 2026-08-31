/**
 * Midnight Compact Bulletin Board Client SDK
 *
 * Implements a high-level, type-safe client adapter for the bulletin-board
 * Compact smart contract on the Midnight blockchain.
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
 * Public ledger state interface representing the decoded contract state.
 */
export type BulletinBoardLedgerState = ContractLedger;

/**
 * Default Private State interface storing the author's local secret key.
 */
export interface BulletinBoardPrivateState {
  readonly secretKey: Uint8Array;
}

/**
 * Type-safe Witnesses specification adhering strictly to Compact Runtime
 * convention of returning a 2-element tuple [PS, ReturnValue].
 */
export type BulletinBoardWitnesses<PS> = ContractWitnesses<PS>;

/**
 * Production-grade Client SDK for interacting with the Midnight Bulletin Board contract.
 */
export class BulletinBoardClient<PS extends BulletinBoardPrivateState = BulletinBoardPrivateState> {
  private readonly contract: ManagedContract<PS>;

  /**
   * Constructs the BulletinBoardClient instance.
   *
   * @param customWitnesses - Optional custom witness implementations. Defaults to reading secretKey from PS.
   */
  constructor(customWitnesses?: BulletinBoardWitnesses<PS>) {
    const defaultWitnesses: ContractWitnesses<PS> = {
      localSecretKey: (context: WitnessContext<ContractLedger, PS>): [PS, Uint8Array] => {
        if (!context.privateState || !context.privateState.secretKey) {
          throw new Error('Witness Error: localSecretKey requested but secretKey is not present in PrivateState');
        }
        if (context.privateState.secretKey.length !== 32) {
          throw new Error(
            `Witness Error: secretKey must be exactly 32 bytes, received ${context.privateState.secretKey.length} bytes`,
          );
        }
        return [context.privateState, context.privateState.secretKey];
      },
    };

    this.contract = new ManagedContract<PS>(customWitnesses ?? defaultWitnesses);
  }

  /**
   * Initializes the contract state off-chain for contract deployment.
   *
   * @param context - Constructor context containing initial private state and coin public key.
   * @returns ConstructorResult containing the initial contract state and private state.
   */
  public initialState(context: ConstructorContext<PS>): ConstructorResult<PS> {
    return this.contract.initialState(context);
  }

  /**
   * Posts a new message to the bulletin board.
   * Board must currently be in the VACANT state.
   *
   * @param context - Circuit execution context.
   * @param message - The string message to post.
   * @returns CircuitResults containing updated circuit context and empty tuple return value.
   */
  public post(context: CircuitContext<PS>, message: string): CircuitResults<PS, []> {
    return this.contract.circuits.post(context, message);
  }

  /**
   * Posts a message or overwrites an existing message if the caller is the owner.
   *
   * @param context - Circuit execution context.
   * @param message - The string message to post or update.
   * @returns CircuitResults containing updated circuit context and empty tuple return value.
   */
  public postMessage(context: CircuitContext<PS>, message: string): CircuitResults<PS, []> {
    return this.contract.circuits.postMessage(context, message);
  }

  /**
   * Takes down an active post from the board.
   * Caller must be the owner tag holder.
   *
   * @param context - Circuit execution context.
   * @returns CircuitResults containing updated circuit context and the former message string.
   */
  public takeDown(context: CircuitContext<PS>): CircuitResults<PS, string> {
    return this.contract.circuits.takeDown(context);
  }

  /**
   * Computes the deterministic owner public key hash inside ZK from a secret key and sequence bytes.
   *
   * @param context - Circuit execution context.
   * @param secretKey - 32-byte author secret key.
   * @param sequence - 32-byte sequence representation.
   * @returns CircuitResults containing the derived 32-byte public key tag.
   */
  public publicKey(
    context: CircuitContext<PS>,
    secretKey: Uint8Array,
    sequence: Uint8Array,
  ): CircuitResults<PS, Uint8Array> {
    return this.contract.circuits.publicKey(context, secretKey, sequence);
  }

  /**
   * Queries and decodes raw contract charged state into typed ledger state.
   *
   * @param rawState - Raw state value or charged state from query context.
   * @returns Decoded BulletinBoardLedgerState.
   */
  public queryLedgerState(rawState: StateValue | ChargedState | unknown): BulletinBoardLedgerState {
    return ledger(rawState as StateValue | ChargedState);
  }
}