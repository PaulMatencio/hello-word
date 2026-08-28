export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const health = await container.getSystemHealthUseCase.execute();
        return NextResponse.json({ success: true, data: health });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch system health',
                deployment: container.deploymentStorage.getDeployment(),
            },
            { status: 500 }
        );
    }
}
