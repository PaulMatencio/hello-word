import { NextResponse } from 'next/server';
import { MidnightSystemAdapter } from '@/src/infrastructure/midnight/midnight-system.adapter';
import { createStorageServices } from '@/src/infrastructure/persistence/storage.factory';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const { deploymentStorage } = createStorageServices();
        const systemAdapter = new MidnightSystemAdapter(deploymentStorage);
        const health = await systemAdapter.getHealthReport();
        return NextResponse.json({ success: true, data: health });
    } catch (error: any) {
        console.error('System health check error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch system health',
            },
            { status: 500 }
        );
    }
}
