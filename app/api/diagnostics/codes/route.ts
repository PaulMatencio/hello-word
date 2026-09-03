import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CodeEntry {
  code: string;
  name: string;
  source: string;
  category: string;
  group?: {
    name: string;
    description: string;
  };
  description: string;
  fixes?: string[];
  aliases?: string[];
  severity?: string;
  see_also?: string[];
  verified_against?: {
    source_repo?: string;
    ref?: string;
    anchor?: string;
  };
}

let cachedEntries: CodeEntry[] | null = null;

function loadEntries(): CodeEntry[] {
  if (cachedEntries) return cachedEntries;
  try {
    const dataPath = path.join(process.cwd(), 'src/infrastructure/data/midnight-codes.json');
    if (fs.existsSync(dataPath)) {
      const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      cachedEntries = raw.entries || [];
    }
  } catch (err) {
    console.error('Failed to load midnight-codes.json:', err);
    cachedEntries = [];
  }
  return cachedEntries || [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const source = searchParams.get('source')?.trim().toLowerCase() || '';
  const category = searchParams.get('category')?.trim().toLowerCase() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  const entries = loadEntries();

  let results = entries;

  if (source && source !== 'all') {
    results = results.filter((e) => e.source?.toLowerCase().includes(source));
  }

  if (category && category !== 'all') {
    results = results.filter((e) => e.category?.toLowerCase().includes(category));
  }

  if (q) {
    results = results.filter((e) => {
      return (
        e.code.toLowerCase() === q ||
        e.code.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.aliases?.some((a) => a.toLowerCase().includes(q)) ||
        e.fixes?.some((f) => f.toLowerCase().includes(q))
      );
    });
  }

  // Get distinct sources and categories for filtering in the UI
  const availableSources = Array.from(new Set(entries.map((e) => e.source))).filter(Boolean);
  const availableCategories = Array.from(new Set(entries.map((e) => e.category))).filter(Boolean);

  return NextResponse.json({
    success: true,
    total: results.length,
    entries: results.slice(0, limit),
    sources: availableSources,
    categories: availableCategories,
  });
}
