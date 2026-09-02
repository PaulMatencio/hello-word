import { describe, it, expect, beforeEach } from 'vitest';
import * as CompactRuntime from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  type Witnesses,
} from '../../contracts/managed/secret-validator/contract/index.js';

// Define the shape of our local private state
interface SecretValidatorPrivateState {
  secretPreimage: Uint8Array;
}

describe('SecretValidator Contract', () => {
  // Deterministic mock test constants
  const mockCoinPublicKey = '01'.repeat(32);
  const mockContractAddress = '00'.repeat(32);

  const initialCommitHash = new Uint8Array(32).fill(0x11);
  const newCommitHash = new Uint8Array(32).fill(0x22);
  const mockPreimage = new Uint8Array(32).fill(0xaa);
  const wrongPreimage = new Uint8Array(32).fill(0xff);

  // Helper to create mock witnesses adhering to the [PrivateState, ReturnValue] convention
  const createMockWitnesses = (preimage: Uint8Array): Witnesses<SecretValidatorPrivateState> => ({
    secretPreimage: (context) => {
      const currentPs = context?.privateState ?? { secretPreimage: preimage };
      return [currentPs, currentPs.secretPreimage ?? preimage];
    },
  });

  let initialPrivateState: SecretValidatorPrivateState;
  let contract: Contract<SecretValidatorPrivateState>;

  beforeEach(() => {
    initialPrivateState = { secretPreimage: mockPreimage };
    contract = new Contract(createMockWitnesses(mockPreimage));
  });

  it('initializes contract state correctly via constructor', () => {
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );

    const { currentContractState, currentPrivateState } = contract.initialState(
      constructorCtx,
      initialCommitHash
    );

    // Query ledger state from constructor output (using currentContractState.data)
    const ledgerState = ledger(currentContractState.data);

    expect(ledgerState.verified).toBe(false);
    expect(ledgerState.commitHash).toEqual(initialCommitHash);
    expect(currentPrivateState).toEqual(initialPrivateState);
  });

  it('updates commitHash and resets verified status via setCommitHash', () => {
    // 1. Initialize contract
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } = contract.initialState(
      constructorCtx,
      initialCommitHash
    );

    // 2. Prepare circuit execution context for setCommitHash
    const circuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );

    // 3. Execute setCommitHash circuit
    const result = contract.circuits.setCommitHash(circuitCtx, newCommitHash);

    // 4. Query updated ledger state from result query context
    const ledgerState = ledger(result.context.currentQueryContext.state);

    expect(ledgerState.commitHash).toEqual(newCommitHash);
    expect(ledgerState.verified).toBe(false);
  });

  it('fails verification when secret preimage does not match commitHash', () => {
    // 1. Initialize contract with an arbitrary hash
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } = contract.initialState(
      constructorCtx,
      initialCommitHash
    );

    // 2. Instantiate contract with a witness returning the wrong preimage
    const failingContract = new Contract(createMockWitnesses(wrongPreimage));

    const circuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );

    // 3. Executing verifySecret must fail with the assert error message
    expect(() => {
      failingContract.circuits.verifySecret(circuitCtx);
    }).toThrow(/Secret does not match committed hash/);
  });

  it('supports chaining multiple state transitions (setCommitHash -> state inspection)', () => {
    // 1. Initialize contract
    const constructorCtx = CompactRuntime.createConstructorContext(
      initialPrivateState,
      mockCoinPublicKey
    );
    const { currentContractState, currentPrivateState } = contract.initialState(
      constructorCtx,
      initialCommitHash
    );

    // 2. First transition: setCommitHash
    const firstCircuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      currentContractState.data,
      currentPrivateState
    );
    const firstResult = contract.circuits.setCommitHash(firstCircuitCtx, newCommitHash);

    const firstLedgerState = ledger(firstResult.context.currentQueryContext.state);
    expect(firstLedgerState.commitHash).toEqual(newCommitHash);

    // 3. Second transition (chaining): Pass result.context.currentQueryContext.state directly
    const secondHash = new Uint8Array(32).fill(0x33);
    const secondCircuitCtx = CompactRuntime.createCircuitContext(
      mockContractAddress,
      mockCoinPublicKey,
      firstResult.context.currentQueryContext.state,
      firstResult.context.currentPrivateState ?? initialPrivateState
    );
    const secondResult = contract.circuits.setCommitHash(secondCircuitCtx, secondHash);

    const secondLedgerState = ledger(secondResult.context.currentQueryContext.state);
    expect(secondLedgerState.commitHash).toEqual(secondHash);
    expect(secondLedgerState.verified).toBe(false);
  });
});