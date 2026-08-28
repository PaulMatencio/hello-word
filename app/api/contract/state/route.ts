import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address') || undefined;

        const state = await container.getContractStateUseCase.execute({ contractAddress: address });
        return NextResponse.json({ success: true, data: state });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch contract state',
                deployment: container.deploymentStorage.getDeployment(),
            },
            { status: 500 }
        );
    }
}
