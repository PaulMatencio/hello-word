import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seed } = body;

        if (!seed) {
            return NextResponse.json({ success: false, error: 'Seed is required.' }, { status: 400 });
        }

        const status = await container.getWalletStatusUseCase.execute({ seed });
        return NextResponse.json({ success: true, data: status });
    } catch (error: any) {
        console.error('Error fetching wallet status:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to fetch wallet status',
            },
            { status: 500 }
        );
    }
}
