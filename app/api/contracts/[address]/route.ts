import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await context.params;
        if (!address) {
            return NextResponse.json({ success: false, error: 'Address parameter is required' }, { status: 400 });
        }

        await container.deploymentStorage.deleteDeployment(address);
        return NextResponse.json({ success: true, message: `Contract ${address} untracked successfully.` });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to delete contract' },
            { status: 500 }
        );
    }
}
