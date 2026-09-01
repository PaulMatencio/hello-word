import { describe, it, expect, beforeEach } from 'vitest';
import * as CompactRuntime from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  State,
  type Witnesses,
} from '../../contracts/managed/bulletin-board/contract/index.js';

interface BulletinBoardPrivateState {
  secretKey: Uint8Array;
}

describe('BulletinBoard Contract Tests', () => {
  const aliceSecretKey = new Uint8Array(32).fill(0xaa);
  const bobSecretKey = new Uint8Array(32).fill(0xbb);
  const mockCoinPublicKey = '01'.repeat(32);
  const mockContractAddress = '00'.repeat(32);

  const createMockWitnesses = (secretKey: Uint8Array): Witnesses<BulletinBoardPrivateState> => ({
    localSecretKey: (context) => {
      const currentPs = context?.privateState ?? { secretKey };
      return [currentPs, currentPs.secretKey ?? secretKey];
    },
  });

  let aliceContract: Contract<BulletinBoardPrivateState>;
  let bobContract: Contract<BulletinBoardPrivateState>;
  let alicePrivateState: BulletinBoardPrivateState;
  let bobPrivateState: BulletinBoardPrivateState;

  beforeEach(() => {
    alicePrivateState = { secretKey: aliceSecretKey };
    bobPrivateState = { secretKey: bobSecretKey };
    aliceContract = new Contract(createMockWitnesses(aliceSecretKey));
    bobContract = new Contract(createMockWitnesses(bobSecretKey));
  });

  it('initializes the bulletin board to VACANT state with sequence counter at 1', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );

    const { currentContractState } = aliceContract.initialState(constructorCtx);
    const ledgerState = ledger(currentContractState.data);

    expect(ledgerState.state).toBe(State.VACANT);
    expect(ledgerState.message.is_some).toBe(false);
    expect(ledgerState.sequence).toBe(1n);
    expect(ledgerState.owner).toEqual(new Uint8Array(32));
  });

  it('allows Alice to post a message when the board is VACANT', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    const postCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );

    const result = aliceContract.circuits.postMessage(postCtx, 'Hello Midnight!');
    const ledgerState = ledger(result.context.currentQueryContext.state);

    expect(ledgerState.state).toBe(State.OCCUPIED);
    expect(ledgerState.message.is_some).toBe(true);
    expect(ledgerState.message.value).toBe('Hello Midnight!');
    expect(ledgerState.sequence).toBe(2n);
    expect(ledgerState.owner).not.toEqual(new Uint8Array(32));
  });

  it('allows the current owner (Alice) to update the posted message', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    // Initial post
    const postCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );
    const postResult = aliceContract.circuits.postMessage(postCtx, 'First Message');

    // Alice updates the message
    const updateCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      postResult.context.currentQueryContext.state,
      postResult.context.currentPrivateState ?? alicePrivateState,
    );
    const updateResult = aliceContract.circuits.postMessage(updateCtx, 'Updated Message');
    const ledgerState = ledger(updateResult.context.currentQueryContext.state);

    expect(ledgerState.state).toBe(State.OCCUPIED);
    expect(ledgerState.message.is_some).toBe(true);
    expect(ledgerState.message.value).toBe('Updated Message');
    expect(ledgerState.sequence).toBe(3n);
  });

  it('prevents a non-owner (Bob) from editing an existing post', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    // Alice posts
    const postCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );
    const postResult = aliceContract.circuits.postMessage(postCtx, 'Alice post');

    // Bob attempts to update
    const bobEditCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      postResult.context.currentQueryContext.state,
      bobPrivateState,
    );

    expect(() => {
      bobContract.circuits.postMessage(bobEditCtx, 'Bob overwrite attempt');
    }).toThrow('Only the current owner can edit the post');
  });

  it('fails when attempting to take down a post from an empty board', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    const takeDownCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );

    expect(() => {
      aliceContract.circuits.takeDown(takeDownCtx);
    }).toThrow('Attempted to take down post from an empty board');
  });

  it('prevents a non-owner (Bob) from taking down Alice post', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    // Alice posts
    const postCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );
    const postResult = aliceContract.circuits.postMessage(postCtx, 'Alice sensitive post');

    // Bob attempts to take down
    const bobTakeDownCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      postResult.context.currentQueryContext.state,
      bobPrivateState,
    );

    expect(() => {
      bobContract.circuits.takeDown(bobTakeDownCtx);
    }).toThrow('Attempted to take down post, but not the current owner');
  });

  it('allows Alice to take down her post and returns former message, resetting state to VACANT', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      alicePrivateState,
      mockCoinPublicKey,
    );
    const { currentContractState, currentPrivateState } = aliceContract.initialState(constructorCtx);

    // Alice posts
    const postCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState ?? alicePrivateState,
    );
    const postResult = aliceContract.circuits.postMessage(postCtx, 'Message to be deleted');

    // Alice takes down
    const takeDownCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      postResult.context.currentQueryContext.state,
      postResult.context.currentPrivateState ?? alicePrivateState,
    );
    const takeDownResult = aliceContract.circuits.takeDown(takeDownCtx);

    // Verify circuit return value
    expect(takeDownResult.result).toBe('Message to be deleted');

    // Verify reset ledger state
    const ledgerState = ledger(takeDownResult.context.currentQueryContext.state);
    expect(ledgerState.state).toBe(State.VACANT);
    expect(ledgerState.message.is_some).toBe(false);
    expect(ledgerState.owner).toEqual(new Uint8Array(32));
    expect(ledgerState.sequence).toBe(3n);

    // Bob can now claim the vacant board
    const bobPostCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      takeDownResult.context.currentQueryContext.state,
      bobPrivateState,
    );
    const bobPostResult = bobContract.circuits.postMessage(bobPostCtx, 'Bob new post');
    const bobLedgerState = ledger(bobPostResult.context.currentQueryContext.state);

    expect(bobLedgerState.state).toBe(State.OCCUPIED);
    expect(bobLedgerState.message.is_some).toBe(true);
    expect(bobLedgerState.message.value).toBe('Bob new post');
    expect(bobLedgerState.sequence).toBe(4n);
  });
});