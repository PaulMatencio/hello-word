import { NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * API route returns an array of transaction hashes persisted by FileTransactionHistoryStorage.
 * The storage writes to `tx-history.json` at the project root.
 */
export async function GET() {
  const filePath = path.resolve(process.cwd(), 'tx-history.json');
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const records = JSON.parse(data);
    return NextResponse.json({ success: true, data: records });
  } catch (err) {
    return NextResponse.json({ success: true, data: [] });
  }
}
