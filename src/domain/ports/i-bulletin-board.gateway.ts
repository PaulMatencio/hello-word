import type {
    BulletinBoardLedgerState,
    BulletinBoardShowcaseResult,
    BulletinBoardCircuitExecutionResult,
} from '../entities/bulletin-board.entity';

export interface ExecuteCircuitOptions {
    sessionId?: string;
    action: 'post' | 'postMessage' | 'takeDown';
    identity?: 'Alice' | 'Bob' | string;
    message?: string;
    secretKeyHex?: string;
}

export interface IBulletinBoardGateway {
    getLiveState(sessionId?: string): Promise<BulletinBoardLedgerState>;
    resetState(sessionId?: string): Promise<BulletinBoardLedgerState>;
    runShowcases(sessionId?: string): Promise<BulletinBoardShowcaseResult>;
    executeCircuit(options: ExecuteCircuitOptions): Promise<BulletinBoardCircuitExecutionResult>;
}
