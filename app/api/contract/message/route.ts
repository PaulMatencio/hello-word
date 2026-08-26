import { NextRequest, NextResponse } from 'next/server';
import { storeContractMessage } from '@/src/lib/midnight-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seed, message, contractAddress } = body;

        if (!seed) {
            return NextResponse.json({ success: false, error: 'Seed is required to submit a transaction.' }, { status: 400 });
        }
        if (!message || message.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Message cannot be empty.' }, { status: 400 });
        }

        const result = await storeContractMessage(seed, message, contractAddress);
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error storing message on-chain:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to submit transaction to contract',
            },
            { status: 500 }
        );
    }
}
