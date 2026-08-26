import { NextResponse } from 'next/server';
import { getSystemHealth, getDefaultDeployment } from '@/src/lib/midnight-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const health = await getSystemHealth();
        return NextResponse.json({ success: true, data: health });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch system health',
                deployment: getDefaultDeployment(),
            },
            { status: 500 }
        );
    }
}
