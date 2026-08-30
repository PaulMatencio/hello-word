import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sourceCode, filename = 'contract.compact', folder = 'contracts' } = body;

        if (!sourceCode || typeof sourceCode !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Source code cannot be empty.' },
                { status: 400 }
            );
        }

        // Ensure appropriate extension (default to .compact only if no extension provided)
        const baseName = path.basename(filename);
        const hasExt = path.extname(baseName).length > 0;
        const safeFilename = hasExt ? baseName : `${baseName}.compact`;

        // Normalize destination directory safely within workspace
        const workspaceRoot = process.cwd();
        const sanitizedFolder = folder.replace(/^(\.\.[\/\\])+/, '');
        const targetDir = path.resolve(workspaceRoot, sanitizedFolder || 'contracts');

        // Prevent path traversal outside workspace
        if (!targetDir.startsWith(workspaceRoot)) {
            return NextResponse.json(
                { success: false, error: 'Invalid destination folder.' },
                { status: 400 }
            );
        }

        await fs.mkdir(targetDir, { recursive: true });
        const filePath = path.join(targetDir, safeFilename);

        await fs.writeFile(filePath, sourceCode, 'utf-8');

        return NextResponse.json({
            success: true,
            data: {
                filename: safeFilename,
                folder: path.relative(workspaceRoot, targetDir) || '.',
                fullPath: filePath,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to save file.' },
            { status: 500 }
        );
    }
}
