export enum BulletinBoardStateEnum {
    VACANT = 0,
    OCCUPIED = 1,
}

export interface BulletinBoardLedgerState {
    state: number;
    message: { is_some: boolean; value: string };
    sequence: number;
    owner: string;
}

export interface BulletinBoardShowcaseStep {
    stepId: number;
    title: string;
    description: string;
    identity: 'Alice' | 'Bob' | 'System';
    circuitName?: 'constructor' | 'post' | 'postMessage' | 'takeDown';
    args?: Record<string, any>;
    status: 'success' | 'expected_error' | 'unexpected_error';
    message: string;
    details?: string;
    previousLedgerState?: BulletinBoardLedgerState;
    nextLedgerState?: BulletinBoardLedgerState;
    durationMs: number;
    timestamp: string;
}

export interface BulletinBoardShowcaseResult {
    action: string;
    steps: BulletinBoardShowcaseStep[];
    logs: string[];
    finalLedgerState?: BulletinBoardLedgerState;
    alicePrivateState: { secretKey: string };
    bobPrivateState: { secretKey: string };
}

export interface BulletinBoardCircuitExecutionResult {
    action: 'post' | 'postMessage' | 'takeDown';
    result: any;
    nextLedgerState?: BulletinBoardLedgerState;
    message: string;
}
