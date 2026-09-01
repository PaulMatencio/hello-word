import { describe, it, expect, beforeEach } from 'vitest';
import { MidnightBulletinBoardAdapter } from '@/src/infrastructure/midnight/midnight-bulletin-board.adapter';
import { GetBulletinBoardStateUseCase } from '@/src/application/use-cases/get-bulletin-board-state.usecase';
import { ResetBulletinBoardStateUseCase } from '@/src/application/use-cases/reset-bulletin-board-state.usecase';
import { RunBulletinBoardShowcaseUseCase } from '@/src/application/use-cases/run-bulletin-board-showcase.usecase';
import { ExecuteBulletinBoardCircuitUseCase } from '@/src/application/use-cases/execute-bulletin-board-circuit.usecase';

describe('Clean Architecture: Bulletin Board Use Cases & Adapter', () => {
    let adapter: MidnightBulletinBoardAdapter;
    let getStateUseCase: GetBulletinBoardStateUseCase;
    let resetStateUseCase: ResetBulletinBoardStateUseCase;
    let runShowcaseUseCase: RunBulletinBoardShowcaseUseCase;
    let executeCircuitUseCase: ExecuteBulletinBoardCircuitUseCase;

    const testSession = 'test-clean-architecture-session';

    beforeEach(() => {
        adapter = new MidnightBulletinBoardAdapter();
        getStateUseCase = new GetBulletinBoardStateUseCase(adapter);
        resetStateUseCase = new ResetBulletinBoardStateUseCase(adapter);
        runShowcaseUseCase = new RunBulletinBoardShowcaseUseCase(adapter);
        executeCircuitUseCase = new ExecuteBulletinBoardCircuitUseCase(adapter);
    });

    it('GetBulletinBoardStateUseCase should return initial VACANT state', async () => {
        const state = await getStateUseCase.execute({ sessionId: testSession });

        expect(state.state).toBe(0); // VACANT
        expect(state.message.is_some).toBe(false);
        expect(state.sequence).toBe(1);
        expect(state.owner).toBeDefined();
    });

    it('RunBulletinBoardShowcaseUseCase should execute complete 6-step ZK showcase suite', async () => {
        const result = await runShowcaseUseCase.execute({ sessionId: testSession });

        expect(result.action).toBe('run_all');
        expect(result.steps).toHaveLength(6);
        expect(result.steps[0].status).toBe('success');
        expect(result.steps[1].status).toBe('success');
        expect(result.steps[2].status).toBe('success'); // Alice owner edit
        expect(result.steps[3].status).toBe('expected_error'); // Bob post rejection
        expect(result.steps[4].status).toBe('expected_error'); // Bob unauthorized takedown
        expect(result.steps[5].status).toBe('success'); // Alice authorized takedown
        expect(result.finalLedgerState?.state).toBe(0); // VACANT
        expect(result.finalLedgerState?.sequence).toBe(4);
    });

    it('ExecuteBulletinBoardCircuitUseCase should allow Alice to post and enforce Bob rejection', async () => {
        // 1. Reset
        await resetStateUseCase.execute({ sessionId: testSession });

        // 2. Alice posts
        const postRes = await executeCircuitUseCase.execute({
            sessionId: testSession,
            action: 'post',
            identity: 'Alice',
            message: 'Clean Architecture First Post',
        });

        expect(postRes.action).toBe('post');
        expect(postRes.nextLedgerState?.state).toBe(1); // OCCUPIED
        expect(postRes.nextLedgerState?.message.value).toBe('Clean Architecture First Post');

        // 3. Bob attempts post on occupied board -> must throw assertion
        await expect(
            executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'post',
                identity: 'Bob',
                message: 'Bob Unauthorized Post',
            })
        ).rejects.toThrow(/Only the current owner can edit the post/);

        // 4. Bob attempts takedown -> must throw ownership assertion
        await expect(
            executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'takeDown',
                identity: 'Bob',
            })
        ).rejects.toThrow(/Attempted to take down post, but not the current owner/);

        // 5. Alice takes down post -> succeeds
        const takeDownRes = await executeCircuitUseCase.execute({
            sessionId: testSession,
            action: 'takeDown',
            identity: 'Alice',
        });

        expect(takeDownRes.action).toBe('takeDown');
        expect(takeDownRes.result).toBe('Clean Architecture First Post');
        expect(takeDownRes.nextLedgerState?.state).toBe(0); // VACANT
        expect(takeDownRes.nextLedgerState?.sequence).toBe(3);
    });

    describe('postMessage Use Cases', () => {
        it('should allow initial post when board is VACANT', async () => {
            await resetStateUseCase.execute({ sessionId: testSession });

            const res = await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Initial Post via postMessage',
            });

            expect(res.action).toBe('postMessage');
            expect(res.nextLedgerState?.state).toBe(1); // OCCUPIED
            expect(res.nextLedgerState?.message.is_some).toBe(true);
            expect(res.nextLedgerState?.message.value).toBe('Initial Post via postMessage');
            expect(res.nextLedgerState?.sequence).toBe(2);
        });

        it('should allow the owner to override their message on an OCCUPIED board', async () => {
            await resetStateUseCase.execute({ sessionId: testSession });

            // 1. Initial post (seq 2)
            await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Original Message',
            });

            // 2. Owner overrides her post (seq 3)
            const overrideRes = await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Updated by Alice',
            });

            expect(overrideRes.nextLedgerState?.state).toBe(1);
            expect(overrideRes.nextLedgerState?.message.value).toBe('Updated by Alice');
            expect(overrideRes.nextLedgerState?.sequence).toBe(3);
        });

        it('should reject message override when called by a non-owner', async () => {
            await resetStateUseCase.execute({ sessionId: testSession });

            // Alice posts
            await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Alice Message',
            });

            // Bob attempts override -> rejected
            await expect(
                executeCircuitUseCase.execute({
                    sessionId: testSession,
                    action: 'postMessage',
                    identity: 'Bob',
                    message: 'Bob Malicious Edit',
                })
            ).rejects.toThrow(/Only the current owner can edit the post/);
        });

        it('should allow consecutive edits by the owner with sequence increments', async () => {
            await resetStateUseCase.execute({ sessionId: testSession });

            // Post 1 (Seq 2)
            await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Revision 1',
            });

            // Post 2 (Seq 3)
            const rev2 = await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Revision 2',
            });
            expect(rev2.nextLedgerState?.sequence).toBe(3);
            expect(rev2.nextLedgerState?.message.value).toBe('Revision 2');

            // Post 3 (Seq 4)
            const rev3 = await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Revision 3',
            });
            expect(rev3.nextLedgerState?.sequence).toBe(4);
            expect(rev3.nextLedgerState?.message.value).toBe('Revision 3');
        });

        it('should allow owner to takeDown post after multiple postMessage updates', async () => {
            await resetStateUseCase.execute({ sessionId: testSession });

            // Initial + 2 updates (seq 2, 3, 4)
            await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'First',
            });
            await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'postMessage',
                identity: 'Alice',
                message: 'Second',
            });

            // Alice takes down post (seq 4)
            const takeDownRes = await executeCircuitUseCase.execute({
                sessionId: testSession,
                action: 'takeDown',
                identity: 'Alice',
            });

            expect(takeDownRes.action).toBe('takeDown');
            expect(takeDownRes.result).toBe('Second');
            expect(takeDownRes.nextLedgerState?.state).toBe(0); // VACANT
            expect(takeDownRes.nextLedgerState?.message.is_some).toBe(false);
            expect(takeDownRes.nextLedgerState?.sequence).toBe(4);
        });
    });
});
