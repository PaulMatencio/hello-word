import { NextRequest, NextResponse } from 'next/server';
import { registerForDust } from '@/src/lib/midnight-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seed } = body;

        if (!seed) {
            return NextResponse.json({ success: false, error: 'Seed is required.' }, { status: 400 });
        }

        const result = await registerForDust(seed);
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error registering for DUST:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to register for DUST generation',
            },
            { status: 500 }
        );
    }
}
