import { describe, it, expect } from 'vitest';
import * as CompactRuntime from '@midnight-ntwrk/compact-runtime';
import { Contract, State, ledger, type Witnesses } from '../../contracts/managed/bulletin-board/contract/index.js';
import * as crypto from 'node:crypto';

describe('Bulletin Board Compact Circuit Unit Tests', () => {
    // Deterministic mock secret key for testing (32 bytes)
    const mockSkA = new Uint8Array(32).fill(1);
    const mockSkB = new Uint8Array(32).fill(2);

    const createMockWitnesses = (sk: Uint8Array): Witnesses<any> => ({
        localSecretKey: (context: any) => {
            const ps = context?.privateState || {};
            return [{ ...ps, secretKey: sk }, sk];
        },
    });

    const setupFreshContract = (sk: Uint8Array = mockSkA) => {
        const witnesses = createMockWitnesses(sk);
        const contract = new Contract(witnesses);
        const dummyCoinPk = '00'.repeat(32);
        const constructorCtx = CompactRuntime.createConstructorContext({}, dummyCoinPk);
        const { currentContractState, currentPrivateState, currentZswapLocalState } = contract.initialState(constructorCtx);

        const circuitCtx = CompactRuntime.createCircuitContext(
            CompactRuntime.dummyContractAddress(),
            currentZswapLocalState.coinPublicKey,
            currentContractState.data,
            currentPrivateState
        );

        return { contract, circuitCtx, currentContractState };
    };

    it('should initialize state as VACANT with empty message', () => {
        const { currentContractState } = setupFreshContract();
        const state = ledger(currentContractState.data);

        expect(state.state).toBe(State.VACANT);
        expect(state.message.is_some).toBe(false);
        expect(state.sequence).toBe(1n);
    });

    it('should allow posting a new message when board is VACANT', () => {
        const { contract, circuitCtx } = setupFreshContract();

        const postResult = contract.circuits.post(circuitCtx, 'Hello, Midnight!');
        expect(postResult).toBeDefined();

        const state = ledger(postResult.context.currentQueryContext.state.state);
        expect(state.state).toBe(State.OCCUPIED);
        expect(state.message.is_some).toBe(true);
        expect(state.message.value).toBe('Hello, Midnight!');
    });

    it('should fail assert when trying to post to an already OCCUPIED board', () => {
        const { contract, circuitCtx } = setupFreshContract();

        // First post occupies board
        const post1 = contract.circuits.post(circuitCtx, 'First Message');

        // Second post on occupied board must throw CompactError
        expect(() => {
            contract.circuits.post(post1.context, 'Second Message');
        }).toThrow(/Attempted to post to an occupied board/);
    });

    it('should allow the post creator (same secret key) to takeDown their post', () => {
        const { contract, circuitCtx } = setupFreshContract(mockSkA);

        // 1. Post a message
        const postResult = contract.circuits.post(circuitCtx, 'Secret note to remove');

        // 2. Take down post with matching secret key
        const takeDownResult = contract.circuits.takeDown(postResult.context);
        expect(takeDownResult.result).toBe('Secret note to remove');

        // 3. Board returns to VACANT and sequence increments
        const state = ledger(takeDownResult.context.currentQueryContext.state.state);
        expect(state.state).toBe(State.VACANT);
        expect(state.message.is_some).toBe(false);
        expect(state.sequence).toBe(2n);
    });

    it('should reject takeDown if called by a non-owner (different secret key)', () => {
        const { contract: contractA, circuitCtx } = setupFreshContract(mockSkA);

        // User A posts
        const postResult = contractA.circuits.post(circuitCtx, "User A's Post");

        // User B tries to take down with their own secret key
        const contractB = new Contract(createMockWitnesses(mockSkB));
        const userBContext = {
            ...postResult.context,
            currentPrivateState: {},
        };

        expect(() => {
            contractB.circuits.takeDown(userBContext);
        }).toThrow(/Attempted to take down post, but not the current owner/);
    });

    describe('postMessage Circuit Tests', () => {
        it('should allow posting when board is VACANT', () => {
            const { contract, circuitCtx } = setupFreshContract(mockSkA);

            const result = contract.circuits.postMessage(circuitCtx, 'Initial Post via postMessage');
            expect(result).toBeDefined();

            const state = ledger(result.context.currentQueryContext.state.state);
            expect(state.state).toBe(State.OCCUPIED);
            expect(state.message.is_some).toBe(true);
            expect(state.message.value).toBe('Initial Post via postMessage');
            expect(state.sequence).toBe(1n);
        });

        it('should allow the owner to override their own message on an OCCUPIED board', () => {
            const { contract, circuitCtx } = setupFreshContract(mockSkA);

            // 1. Initial post
            const post1 = contract.circuits.postMessage(circuitCtx, 'First Message');
            const state1 = ledger(post1.context.currentQueryContext.state.state);
            expect(state1.message.value).toBe('First Message');
            expect(state1.sequence).toBe(1n);

            // 2. Owner overrides their message
            const post2 = contract.circuits.postMessage(post1.context, 'Updated Message by Owner');
            const state2 = ledger(post2.context.currentQueryContext.state.state);
            expect(state2.state).toBe(State.OCCUPIED);
            expect(state2.message.is_some).toBe(true);
            expect(state2.message.value).toBe('Updated Message by Owner');
            // Sequence increments on owner override
            expect(state2.sequence).toBe(2n);
        });

        it('should reject message override if called by a non-owner (different secret key)', () => {
            const { contract: contractA, circuitCtx } = setupFreshContract(mockSkA);

            // User A posts
            const post1 = contractA.circuits.postMessage(circuitCtx, "User A's Initial Message");

            // User B attempts to override User A's message
            const contractB = new Contract(createMockWitnesses(mockSkB));
            const userBContext = {
                ...post1.context,
                currentPrivateState: {},
            };

            expect(() => {
                contractB.circuits.postMessage(userBContext, "User B's Malicious Override");
            }).toThrow(/Only the current owner can override their message/);
        });

        it('should allow owner to takeDown after overriding their message with postMessage', () => {
            const { contract, circuitCtx } = setupFreshContract(mockSkA);

            // 1. Post initial
            const post1 = contract.circuits.postMessage(circuitCtx, 'Original Message');
            // 2. Override
            const post2 = contract.circuits.postMessage(post1.context, 'Edited Message');

            // 3. Take down edited message
            const takeDownRes = contract.circuits.takeDown(post2.context);
            expect(takeDownRes.result).toBe('Edited Message');

            const finalState = ledger(takeDownRes.context.currentQueryContext.state.state);
            expect(finalState.state).toBe(State.VACANT);
            expect(finalState.message.is_some).toBe(false);
            expect(finalState.sequence).toBe(3n);
        });
    });
});

