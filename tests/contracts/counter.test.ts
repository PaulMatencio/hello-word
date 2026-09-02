import { describe, it, expect, beforeEach } from 'vitest';
import * as CompactRuntime from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  State,
  type Witnesses,
} from '../../contracts/managed/counter/contract/index.js';

// Define private state shape for the counter client
interface CounterPrivateState {
  readonly secretKey?: Uint8Array;
}

describe('Counter Smart Contract Unit Tests', () => {
  const aliceSecretKey = new Uint8Array(32).fill(0xaa);
  const mockCoinPublicKey = '01'.repeat(32);
  const mockContractAddress = '00'.repeat(32);

  const initialPrivateState: CounterPrivateState = {
    secretKey: aliceSecretKey,
  };

  const createMockWitnesses = (
    _secretKey: Uint8Array
  ): Witnesses<CounterPrivateState> => ({
    // Counter contract does not define witness functions,
    // but the typed witness map satisfies the contract interface
  });

  let contract: Contract<CounterPrivateState>;

  beforeEach(() => {
    const witnesses = createMockWitnesses(aliceSecretKey);
    contract = new Contract(witnesses);
  });

  it('initializes the ledger count to 0 upon deployment', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );

    const { currentContractState } = contract.initialState(constructorCtx);
    const ledgerState = ledger(currentContractState.data);

    expect(ledgerState.count).toBe(0n);
  });

  it('successfully increments the counter by a positive value', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } =
      contract.initialState(constructorCtx);

    const circuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );

    const incrementStep = 5n;
    const result = contract.circuits.increment(circuitCtx, incrementStep);

    const ledgerState = ledger(result.context.currentQueryContext.state);
    expect(ledgerState.count).toBe(5n);
  });

  it('correctly chains multiple increment operations', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } =
      contract.initialState(constructorCtx);

    // Step 1: Increment by 3
    const ctx1 = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );
    const result1 = contract.circuits.increment(ctx1, 3n);
    expect(ledger(result1.context.currentQueryContext.state).count).toBe(3n);

    // Step 2: Increment by 7 (passing previous query context state directly)
    const ctx2 = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      result1.context.currentQueryContext.state,
      result1.context.currentPrivateState ?? initialPrivateState
    );
    const result2 = contract.circuits.increment(ctx2, 7n);
    expect(ledger(result2.context.currentQueryContext.state).count).toBe(10n);
  });

  it('resets the counter back to 0 after increments', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } =
      contract.initialState(constructorCtx);

    // Step 1: Increment by 15
    const incrementCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );
    const incrementResult = contract.circuits.increment(incrementCtx, 15n);
    expect(ledger(incrementResult.context.currentQueryContext.state).count).toBe(15n);

    // Step 2: Reset counter
    const resetCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      incrementResult.context.currentQueryContext.state,
      incrementResult.context.currentPrivateState ?? initialPrivateState
    );
    const resetResult = contract.circuits.reset(resetCtx);

    const ledgerState = ledger(resetResult.context.currentQueryContext.state);
    expect(ledgerState.count).toBe(0n);
  });

  it('fails with an assertion error when incrementing by zero', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } =
      contract.initialState(constructorCtx);

    const circuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );

    // Expect assertion failure: "Increment step must be greater than zero"
    expect(() => {
      contract.circuits.increment(circuitCtx, 0n);
    }).toThrow(/Increment step must be greater than zero/i);
  });
});