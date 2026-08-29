import { describe, it, expect } from 'vitest';
import * as CompactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../../contracts/managed/hello-world/contract/index.js';

describe('Hello World Compact Circuit Unit Tests', () => {
    it('should initialize with an empty message and store a new message', () => {
        const contract = new Contract({});
        const dummyCoinPk = '00'.repeat(32);
        const constructorCtx = CompactRuntime.createConstructorContext({}, dummyCoinPk);
        const { currentContractState, currentPrivateState, currentZswapLocalState } = contract.initialState(constructorCtx);

        const circuitCtx = CompactRuntime.createCircuitContext(
            CompactRuntime.dummyContractAddress(),
            currentZswapLocalState.coinPublicKey,
            currentContractState.data,
            currentPrivateState
        );

        // Execute storeMessage circuit
        const result = contract.circuits.storeMessage(circuitCtx, 'Hello, Midnight Preprod!');
        expect(result).toBeDefined();

        // Verify updated on-chain state
        const updatedState = ledger(result.context.currentQueryContext.state.state);
        expect(updatedState.message).toBe('Hello, Midnight Preprod!');
    });
});
