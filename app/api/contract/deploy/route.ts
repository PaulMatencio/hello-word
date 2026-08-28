import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { seed } = body;

        if (!seed) {
            return NextResponse.json({ success: false, error: 'Seed is required to deploy a contract.' }, { status: 400 });
        }

        const result = await container.deployContractUseCase.execute({ seed });
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error deploying contract:', error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || 'Failed to deploy contract',
            },
            { status: 500 }
        );
    }
}
