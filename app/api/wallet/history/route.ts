import { NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/di/container';

export const dynamic = 'force-dynamic';

/**
 * API route returns the list of transaction records persisted across sessions.
 */
export async function GET() {
  try {
    const records = await container.txHistoryStorage.getTxRecords();
    return NextResponse.json({ success: true, data: records });
  } catch (err) {
    return NextResponse.json({ success: true, data: [] });
  }
}
