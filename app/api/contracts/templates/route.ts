import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const catalogPath = path.join(process.cwd(), 'src/infrastructure/data/templates/catalog.json');
    if (fs.existsSync(catalogPath)) {
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      return NextResponse.json({
        success: true,
        templates: data,
      });
    }
    return NextResponse.json({ success: true, templates: [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
