import {
    createConstructorContext,
    createCircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
    BulletinBoardClient,
    type BulletinBoardPrivateState,
    type BulletinBoardLedgerState as SdkLedgerState,
} from '@/src/client/bulletin-board-sdk';
import type {
    IBulletinBoardGateway,
    ExecuteCircuitOptions,
} from '@/src/domain/ports/i-bulletin-board.gateway';
import type {
    BulletinBoardLedgerState,
    BulletinBoardShowcaseResult,
    BulletinBoardShowcaseStep,
    BulletinBoardCircuitExecutionResult,
} from '@/src/domain/entities/bulletin-board.entity';

interface SessionState {
    chargedState: any;
    alicePrivateState: BulletinBoardPrivateState;
    bobPrivateState: BulletinBoardPrivateState;
    lastUpdated: number;
}

export class MidnightBulletinBoardAdapter implements IBulletinBoardGateway {
    private readonly sessions = new Map<string, SessionState>();
    private readonly client = new BulletinBoardClient<BulletinBoardPrivateState>();
    private readonly coinPublicKey = '01'.repeat(32);
    private readonly contractAddress = '00'.repeat(32);

    private serializeLedgerState(state?: SdkLedgerState): BulletinBoardLedgerState | undefined {
        if (!state) return undefined;
        return {
            state: Number(state.state),
            message: {
                is_some: Boolean(state.message.is_some),
                value: state.message.value,
            },
            sequence: Number(state.sequence),
            owner: Buffer.from(state.owner).toString('hex'),
        };
    }

    private getOrCreateSession(sessionId: string = 'default'): SessionState {
        let session = this.sessions.get(sessionId);
        if (!session) {
            const aliceSecretKey = new Uint8Array(32).fill(7);
            const bobSecretKey = new Uint8Array(32).fill(9);

            const alicePrivateState: BulletinBoardPrivateState = { secretKey: aliceSecretKey };
            const bobPrivateState: BulletinBoardPrivateState = { secretKey: bobSecretKey };

            const constructorCtx = createConstructorContext<BulletinBoardPrivateState>(
                alicePrivateState,
                this.coinPublicKey
            );
            const initResult = this.client.initialState(constructorCtx);

            session = {
                chargedState: initResult.currentContractState.data,
                alicePrivateState: initResult.currentPrivateState,
                bobPrivateState,
                lastUpdated: Date.now(),
            };
            this.sessions.set(sessionId, session);
        }
        return session;
    }

    async getLiveState(sessionId: string = 'default'): Promise<BulletinBoardLedgerState> {
        const session = this.getOrCreateSession(sessionId);
        const raw = this.client.queryLedgerState(session.chargedState);
        return this.serializeLedgerState(raw)!;
    }

    async resetState(sessionId: string = 'default'): Promise<BulletinBoardLedgerState> {
        this.sessions.delete(sessionId);
        const session = this.getOrCreateSession(sessionId);
        const raw = this.client.queryLedgerState(session.chargedState);
        return this.serializeLedgerState(raw)!;
    }

    async runShowcases(sessionId: string = 'default'): Promise<BulletinBoardShowcaseResult> {
        this.sessions.delete(sessionId);
        const session = this.getOrCreateSession(sessionId);

        const steps: BulletinBoardShowcaseStep[] = [];
        const logs: string[] = [];
        const log = (text: string) => logs.push(`[${new Date().toLocaleTimeString()}] ${text}`);

        log('=== Initializing Bulletin Board Showcase Suite ===');

        // Step 1: Initialized Contract
        const t0 = Date.now();
        let currentLedger = this.client.queryLedgerState(session.chargedState);
        log(`[Step 1] Initialized Contract -> State: VACANT (0), Sequence: ${currentLedger.sequence}`);

        steps.push({
            stepId: 1,
            title: 'Contract Initialization',
            description: 'Deploy fresh Bulletin Board contract via constructor with Alice as deployer.',
            identity: 'Alice',
            circuitName: 'constructor',
            status: 'success',
            message: 'Contract initialized in VACANT state at Sequence #1.',
            details: JSON.stringify({ state: 'VACANT (0)', sequence: Number(currentLedger.sequence), message: 'None' }),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t0,
            timestamp: new Date().toISOString(),
        });

        // Step 2: Alice Posts Message 1
        const t1 = Date.now();
        const prev1 = currentLedger;
        const aliceCtx1 = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            session.alicePrivateState
        );

        const msg1 = 'Hello Midnight Zero-Knowledge World!';
        log(`[Step 2] Alice posting message: "${msg1}"...`);
        const postRes1 = this.client.post(aliceCtx1, msg1);
        session.chargedState = postRes1.context.currentQueryContext.state;
        session.alicePrivateState = postRes1.context.currentPrivateState;
        currentLedger = this.client.queryLedgerState(session.chargedState);

        const ownerTagHex = Buffer.from(currentLedger.owner).toString('hex');
        log(`[Step 2] Post confirmed -> State: OCCUPIED (1), Owner Tag: ${ownerTagHex.slice(0, 16)}...`);

        steps.push({
            stepId: 2,
            title: 'Alice Posts Message',
            description: 'Alice generates ZK proof, transitions board to OCCUPIED, and records owner commitment hash.',
            identity: 'Alice',
            circuitName: 'post',
            args: { message: msg1 },
            status: 'success',
            message: `Message posted successfully: "${msg1}"`,
            details: JSON.stringify({ state: 'OCCUPIED (1)', message: msg1, owner: ownerTagHex }),
            previousLedgerState: this.serializeLedgerState(prev1),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t1,
            timestamp: new Date().toISOString(),
        });

        // Step 3: Alice Attempts Duplicate Post While Occupied
        const t2 = Date.now();
        const prev2 = currentLedger;
        const aliceCtx2 = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            session.alicePrivateState
        );

        log('[Step 3] Alice attempts 2nd post while board is OCCUPIED (Expecting assert failure)...');
        let step3Status: 'expected_error' | 'unexpected_error' = 'unexpected_error';
        let step3Msg = '';

        try {
            this.client.post(aliceCtx2, 'Duplicate message should fail');
            step3Msg = 'UNEXPECTED: Duplicate post succeeded without assertion check.';
        } catch (err: any) {
            step3Status = 'expected_error';
            step3Msg = `Expected assertion error caught: "${err.message || 'failed assert: Attempted to post to an occupied board'}"`;
            log(`[Step 3] ${step3Msg}`);
        }

        steps.push({
            stepId: 3,
            title: 'Duplicate Post Rejection (Alice)',
            description: 'Asserts that post() circuit strictly rejects submissions when board is already OCCUPIED.',
            identity: 'Alice',
            circuitName: 'post',
            status: step3Status,
            message: step3Msg,
            previousLedgerState: this.serializeLedgerState(prev2),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t2,
            timestamp: new Date().toISOString(),
        });

        // Step 4: Bob Attempts Post on Occupied Board
        const t3 = Date.now();
        const prev3 = currentLedger;
        const bobCtx1 = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            session.bobPrivateState
        );

        log('[Step 4] Bob attempts to post while board is OCCUPIED (Expecting assert failure)...');
        let step4Status: 'expected_error' | 'unexpected_error' = 'unexpected_error';
        let step4Msg = '';

        try {
            this.client.post(bobCtx1, 'Bob message on occupied board');
            step4Msg = 'UNEXPECTED: Bob was able to post to occupied board.';
        } catch (err: any) {
            step4Status = 'expected_error';
            step4Msg = `Expected assertion error caught: "${err.message || 'failed assert: Attempted to post to an occupied board'}"`;
            log(`[Step 4] ${step4Msg}`);
        }

        steps.push({
            stepId: 4,
            title: 'Unauthorized Post Rejection (Bob)',
            description: 'Third-party (Bob) attempts to overwrite board; circuit enforces State.VACANT rule.',
            identity: 'Bob',
            circuitName: 'post',
            status: step4Status,
            message: step4Msg,
            previousLedgerState: this.serializeLedgerState(prev3),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t3,
            timestamp: new Date().toISOString(),
        });

        // Step 5: Bob Attempts Unauthorized Takedown
        const t4 = Date.now();
        const prev4 = currentLedger;
        const bobCtx2 = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            session.bobPrivateState
        );

        log('[Step 5] Bob attempts unauthorized takedown of Alice post (Expecting assert failure)...');
        let step5Status: 'expected_error' | 'unexpected_error' = 'unexpected_error';
        let step5Msg = '';

        try {
            this.client.takeDown(bobCtx2);
            step5Msg = 'UNEXPECTED: Bob was able to take down Alice post.';
        } catch (err: any) {
            step5Status = 'expected_error';
            step5Msg = `Expected assertion error caught: "${err.message || 'failed assert: Attempted to take down post, but not the current owner'}"`;
            log(`[Step 5] ${step5Msg}`);
        }

        steps.push({
            stepId: 5,
            title: 'Unauthorized Takedown Rejection (Bob)',
            description: 'Bob attempts takeDown(); circuit enforces cryptographic owner commitment check (assert owner == caller_pk).',
            identity: 'Bob',
            circuitName: 'takeDown',
            status: step5Status,
            message: step5Msg,
            previousLedgerState: this.serializeLedgerState(prev4),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t4,
            timestamp: new Date().toISOString(),
        });

        // Step 6: Alice Authorized Takedown
        const t5 = Date.now();
        const prev5 = currentLedger;
        const aliceCtx3 = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            session.alicePrivateState
        );

        log('[Step 6] Alice takes down her own post...');
        const takeDownRes = this.client.takeDown(aliceCtx3);
        session.chargedState = takeDownRes.context.currentQueryContext.state;
        session.alicePrivateState = takeDownRes.context.currentPrivateState;
        currentLedger = this.client.queryLedgerState(session.chargedState);

        log(`[Step 6] Post taken down successfully. Removed message: "${takeDownRes.result}". New state: VACANT, Sequence: ${currentLedger.sequence}`);

        steps.push({
            stepId: 6,
            title: 'Authorized Takedown (Alice)',
            description: 'Alice proves ownership off-chain, removes post, increments sequence to #2, and resets board to VACANT.',
            identity: 'Alice',
            circuitName: 'takeDown',
            status: 'success',
            message: `Post removed: "${takeDownRes.result}". Board returned to VACANT state at Sequence #${currentLedger.sequence}.`,
            details: JSON.stringify({ state: 'VACANT (0)', sequence: Number(currentLedger.sequence), removedMessage: takeDownRes.result }),
            previousLedgerState: this.serializeLedgerState(prev5),
            nextLedgerState: this.serializeLedgerState(currentLedger),
            durationMs: Date.now() - t5,
            timestamp: new Date().toISOString(),
        });

        log('=== Showcase Suite Completed Successfully ===');

        return {
            action: 'run_all',
            steps,
            logs,
            finalLedgerState: this.serializeLedgerState(currentLedger),
            alicePrivateState: {
                secretKey: Buffer.from(session.alicePrivateState.secretKey).toString('hex'),
            },
            bobPrivateState: {
                secretKey: Buffer.from(session.bobPrivateState.secretKey).toString('hex'),
            },
        };
    }

    async executeCircuit(options: ExecuteCircuitOptions): Promise<BulletinBoardCircuitExecutionResult> {
        const {
            sessionId = 'default',
            action,
            identity = 'Alice',
            message,
            secretKeyHex,
        } = options;

        const session = this.getOrCreateSession(sessionId);

        let callerPrivateState: BulletinBoardPrivateState;
        if (identity === 'Bob') {
            callerPrivateState = session.bobPrivateState;
        } else if (secretKeyHex) {
            callerPrivateState = { secretKey: Buffer.from(secretKeyHex, 'hex') };
        } else {
            callerPrivateState = session.alicePrivateState;
        }

        const circuitCtx = createCircuitContext<BulletinBoardPrivateState>(
            this.contractAddress,
            this.coinPublicKey,
            session.chargedState,
            callerPrivateState
        );

        if (action === 'post') {
            const postText = message || 'Custom Bulletin Board Post';
            const postRes = this.client.post(circuitCtx, postText);
            session.chargedState = postRes.context.currentQueryContext.state;
            if (identity === 'Alice') {
                session.alicePrivateState = postRes.context.currentPrivateState;
            } else if (identity === 'Bob') {
                session.bobPrivateState = postRes.context.currentPrivateState;
            }
            const nextLedger = this.client.queryLedgerState(session.chargedState);

            return {
                action: 'post',
                result: postRes.result,
                nextLedgerState: this.serializeLedgerState(nextLedger),
                message: `Successfully executed post("${postText}")`,
            };
        }

        if (action === 'postMessage') {
            const postText = message || 'Custom Bulletin Board Post';
            const postRes = this.client.postMessage(circuitCtx, postText);
            session.chargedState = postRes.context.currentQueryContext.state;
            if (identity === 'Alice') {
                session.alicePrivateState = postRes.context.currentPrivateState;
            } else if (identity === 'Bob') {
                session.bobPrivateState = postRes.context.currentPrivateState;
            }
            const nextLedger = this.client.queryLedgerState(session.chargedState);

            return {
                action: 'postMessage',
                result: postRes.result,
                nextLedgerState: this.serializeLedgerState(nextLedger),
                message: `Successfully executed postMessage("${postText}")`,
            };
        }

        if (action === 'takeDown') {
            const takeDownRes = this.client.takeDown(circuitCtx);
            session.chargedState = takeDownRes.context.currentQueryContext.state;
            if (identity === 'Alice') {
                session.alicePrivateState = takeDownRes.context.currentPrivateState;
            } else if (identity === 'Bob') {
                session.bobPrivateState = takeDownRes.context.currentPrivateState;
            }
            const nextLedger = this.client.queryLedgerState(session.chargedState);

            return {
                action: 'takeDown',
                result: takeDownRes.result,
                nextLedgerState: this.serializeLedgerState(nextLedger),
                message: `Successfully executed takeDown(). Removed message: "${takeDownRes.result}"`,
            };
        }

        throw new Error(`Unsupported action: ${action}`);
    }
}
