import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';

interface WorkspaceContractFile {
    name: string;
    relativePath: string;
    sizeBytes: number;
    updatedAt: string;
}

async function scanForCompactFiles(dir: string, baseDir: string): Promise<WorkspaceContractFile[]> {
    const files: WorkspaceContractFile[] = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== 'managed' && entry.name !== 'node_modules' && entry.name !== '.git') {
                    const subFiles = await scanForCompactFiles(fullPath, baseDir);
                    files.push(...subFiles);
                }
            } else if (entry.isFile() && entry.name.endsWith('.compact')) {
                const stat = await fs.stat(fullPath);
                files.push({
                    name: entry.name,
                    relativePath: path.relative(baseDir, fullPath),
                    sizeBytes: stat.size,
                    updatedAt: stat.mtime.toISOString(),
                });
            }
        }
    } catch (e) {
        console.warn('Error scanning directory for .compact files:', e);
    }
    return files;
}

export async function GET(req: NextRequest) {
    const workspaceRoot = process.cwd();
    const contractsDir = path.join(workspaceRoot, 'contracts');

    try {
        const searchParams = req.nextUrl.searchParams;
        const targetFile = searchParams.get('file');

        // If specific file requested, return its content
        if (targetFile) {
            const safePath = path.resolve(contractsDir, targetFile.replace(/^(\.\.[\/\\])+/, ''));
            if (!safePath.startsWith(contractsDir) && !safePath.startsWith(workspaceRoot)) {
                return NextResponse.json({ success: false, error: 'Invalid file path.' }, { status: 400 });
            }

            const content = await fs.readFile(safePath, 'utf-8');
            return NextResponse.json({
                success: true,
                data: {
                    filename: path.basename(safePath),
                    relativePath: path.relative(contractsDir, safePath),
                    content,
                },
            });
        }

        // Otherwise list all .compact files in contracts directory
        const files = await scanForCompactFiles(contractsDir, contractsDir);

        return NextResponse.json({
            success: true,
            data: files,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to list contract files.' },
            { status: 500 }
        );
    }
}
