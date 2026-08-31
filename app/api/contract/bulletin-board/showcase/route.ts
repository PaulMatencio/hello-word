import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';
import type {
    BulletinBoardLedgerState,
    BulletinBoardShowcaseStep,
    BulletinBoardShowcaseResult,
    BulletinBoardCircuitExecutionResult,
} from '@/src/domain/entities/bulletin-board.entity';

export const dynamic = 'force-dynamic';

export type {
    BulletinBoardLedgerState as SerializableLedgerState,
    BulletinBoardShowcaseStep as ShowcaseStepResult,
    BulletinBoardShowcaseResult,
    BulletinBoardCircuitExecutionResult,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            action = 'run_all',
            customAction,
            message,
            secretKeyHex,
            identity = 'Alice',
            sessionId = 'default',
        } = body;

        // 1. Get Live State
        if (action === 'get_state') {
            const state = await container.getBulletinBoardStateUseCase.execute({ sessionId });
            return NextResponse.json({
                success: true,
                data: {
                    ledgerState: state,
                },
            });
        }

        // 2. Reset State
        if (action === 'reset') {
            const state = await container.resetBulletinBoardStateUseCase.execute({ sessionId });
            return NextResponse.json({
                success: true,
                data: {
                    message: 'Workbench state reset to initial VACANT state.',
                    ledgerState: state,
                },
            });
        }

        // 3. Run All Showcases Flow
        if (action === 'run_all') {
            const result = await container.runBulletinBoardShowcaseUseCase.execute({ sessionId });
            return NextResponse.json({
                success: true,
                data: result,
            });
        }

        // 4. Custom Interactive Single Circuit Execution
        if (action === 'custom_circuit') {
            if (!customAction) {
                return NextResponse.json({ success: false, error: 'Missing customAction' }, { status: 400 });
            }

            try {
                const result = await container.executeBulletinBoardCircuitUseCase.execute({
                    sessionId,
                    action: customAction,
                    identity,
                    message,
                    secretKeyHex,
                });

                return NextResponse.json({
                    success: true,
                    data: result,
                });
            } catch (err: any) {
                const liveState = await container.getBulletinBoardStateUseCase.execute({ sessionId });
                return NextResponse.json({
                    success: false,
                    error: err.message || 'Circuit assertion failed',
                    expectedAssertion: true,
                    data: {
                        nextLedgerState: liveState,
                    },
                }, { status: 400 });
            }
        }

        return NextResponse.json({ success: false, error: 'Unknown action specified' }, { status: 400 });
    } catch (err: any) {
        console.error('Bulletin board showcase API error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Circuit execution failed',
        }, { status: 500 });
    }
}
