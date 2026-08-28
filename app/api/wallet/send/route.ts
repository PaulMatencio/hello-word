// app/api/wallet/send/route.ts
import { container } from '@/src/infrastructure/di/container';

export async function POST(request: Request) {
  try {
    const { seed, receiver, amount } = await request.json();

    if (!seed || !receiver || !amount) {
      return Response.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }
    const result = await container.sendUnshieldedTNightUseCase.execute({ seed, receiver, amount });
    return Response.json({ success: true, data: result }, { status: 200 });
  } catch (e: any) {
    console.error('Send error:', e);
    return Response.json({ success: false, error: e.message || 'Internal error' }, { status: 500 });
  }
}
