import { NextRequest, NextResponse } from 'next/server';
import { getContractState, getDefaultDeployment } from '@/src/lib/midnight-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address') || undefined;

        const state = await getContractState(address);
        return NextResponse.json({ success: true, data: state });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch contract state',
                deployment: getDefaultDeployment(),
            },
            { status: 500 }
        );
    }
}
