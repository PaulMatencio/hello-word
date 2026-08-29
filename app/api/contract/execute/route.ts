import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seed, contractAddress, circuitName, args = {} } = body;

        if (!seed || typeof seed !== 'string') {
            return NextResponse.json({ success: false, error: 'Wallet seed is required.' }, { status: 400 });
        }

        if (!contractAddress || typeof contractAddress !== 'string') {
            return NextResponse.json({ success: false, error: 'Target contract address is required.' }, { status: 400 });
        }

        if (!circuitName || typeof circuitName !== 'string') {
            return NextResponse.json({ success: false, error: 'Circuit name is required.' }, { status: 400 });
        }

        // Route to circuit executor
        if (circuitName === 'storeMessage') {
            const message = args.message || args[0] || '';
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return NextResponse.json({ success: false, error: 'Message argument is required for storeMessage.' }, { status: 400 });
            }

            const receipt = await container.storeMessageUseCase.execute({
                seed: seed.trim(),
                message: message.trim(),
                contractAddress: contractAddress.trim(),
            });

            return NextResponse.json({
                success: true,
                data: receipt,
            });
        }

        // Generic circuit handler (e.g. bulletin-board post, takeDown)
        let positionalArgs: any[] = [];
        if (Array.isArray(args)) {
            positionalArgs = args;
        } else if (typeof args === 'object' && args !== null) {
            positionalArgs = Object.values(args);
        }

        const receipt = await container.contractGateway.executeCircuit(
            seed.trim(),
            contractAddress.trim(),
            circuitName.trim(),
            positionalArgs,
            body.contractType || 'bulletin-board'
        );

        return NextResponse.json({
            success: true,
            data: receipt,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Circuit execution failed' },
            { status: 500 }
        );
    }
}
