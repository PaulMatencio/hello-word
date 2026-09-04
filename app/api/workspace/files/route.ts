import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The 8 allowed top-level workspace folders and their real project directories
const FOLDER_MAP: Record<string, string> = {
    contracts: 'contracts',
    sdk: 'src/client',
    examples: 'examples',
    docs: 'docs',
    scripts: 'scripts',
    modules: 'contracts/modules',
    tests: 'tests',
    utils: 'contracts/modules/utils',
};

const ALLOWED_FOLDERS = Object.keys(FOLDER_MAP);

export interface WorkspaceFileNode {
    name: string;
    path: string; // virtual explorer path (e.g. 'sdk/fungible-token-sdk.ts')
    isDir: boolean;
    sizeBytes?: number;
    updatedAt?: string;
    extension?: string;
    language?: string;
    children?: WorkspaceFileNode[];
}

function detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.compact':
            return 'compact';
        case '.ts':
        case '.tsx':
            return 'typescript';
        case '.js':
        case '.jsx':
        case '.mjs':
        case '.cjs':
            return 'javascript';
        case '.json':
            return 'json';
        case '.md':
        case '.markdown':
            return 'markdown';
        case '.sh':
        case '.bash':
            return 'shell';
        case '.css':
            return 'css';
        case '.html':
            return 'html';
        case '.yaml':
        case '.yml':
            return 'yaml';
        default:
            return 'plaintext';
    }
}

function resolveRealPath(virtualPath: string, workspaceRoot: string): { safeFullPath: string; isAllowed: boolean } {
    const clean = virtualPath.replace(/^\/+/, '').replace(/^(\.\.[\/\\])+/, '');
    const parts = clean.split(/[\/\\]/);
    const topFolder = parts[0];
    const subPath = parts.slice(1).join('/');

    if (!FOLDER_MAP[topFolder]) {
        return { safeFullPath: '', isAllowed: false };
    }

    const realBase = FOLDER_MAP[topFolder];
    const fullPath = path.resolve(workspaceRoot, realBase, subPath);

    const isInsideWorkspace = fullPath.startsWith(workspaceRoot);
    return { safeFullPath: fullPath, isAllowed: isInsideWorkspace };
}

async function scanDirectory(
    dirFullPath: string,
    virtualBasePath: string,
    depth: number = 0
): Promise<WorkspaceFileNode[]> {
    if (depth > 6) return []; // prevent infinite recursion
    const nodes: WorkspaceFileNode[] = [];

    try {
        const entries = await fs.readdir(dirFullPath, { withFileTypes: true });

        for (const entry of entries) {
            // Ignore hidden and heavy build output folders
            if (
                entry.name.startsWith('.') ||
                entry.name === 'node_modules' ||
                entry.name === 'managed' ||
                entry.name === 'dist' ||
                entry.name === 'build'
            ) {
                continue;
            }

            const fullPath = path.join(dirFullPath, entry.name);
            const virtualPath = `${virtualBasePath}/${entry.name}`;

            let isDirectory = entry.isDirectory();
            if (!isDirectory && entry.isSymbolicLink()) {
                try {
                    const realStat = await fs.stat(fullPath);
                    isDirectory = realStat.isDirectory();
                } catch {
                    isDirectory = false;
                }
            }

            if (isDirectory) {
                const subChildren = await scanDirectory(fullPath, virtualPath, depth + 1);
                nodes.push({
                    name: entry.name,
                    path: virtualPath,
                    isDir: true,
                    children: subChildren,
                });
            } else {
                try {
                    const stat = await fs.stat(fullPath);
                    const ext = path.extname(entry.name).toLowerCase();
                    nodes.push({
                        name: entry.name,
                        path: virtualPath,
                        isDir: false,
                        sizeBytes: stat.size,
                        updatedAt: stat.mtime.toISOString(),
                        extension: ext,
                        language: detectLanguage(entry.name),
                    });
                } catch (statErr) {
                    console.warn(`Could not stat file ${fullPath}:`, statErr);
                }
            }
        }
    } catch (err) {
        console.warn(`Could not scan dir ${dirFullPath}:`, err);
    }

    // Sort: directories first, then alphabetical
    return nodes.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

export async function GET(req: NextRequest) {
    const workspaceRoot = process.cwd();

    try {
        const searchParams = req.nextUrl.searchParams;
        const targetFile = searchParams.get('file');

        // Mode 1: Fetch single file content
        if (targetFile) {
            const { safeFullPath, isAllowed } = resolveRealPath(targetFile, workspaceRoot);

            if (!isAllowed || !safeFullPath) {
                return NextResponse.json(
                    { success: false, error: `Access denied. File must be within: ${ALLOWED_FOLDERS.join(', ')}` },
                    { status: 403 }
                );
            }

            const stat = await fs.stat(safeFullPath);
            if (stat.isDirectory()) {
                return NextResponse.json(
                    { success: false, error: 'Requested path is a directory, not a file.' },
                    { status: 400 }
                );
            }

            const content = await fs.readFile(safeFullPath, 'utf-8');
            const filename = path.basename(safeFullPath);

            return NextResponse.json({
                success: true,
                data: {
                    path: targetFile.replace(/^\/+/, ''),
                    filename,
                    content,
                    sizeBytes: stat.size,
                    updatedAt: stat.mtime.toISOString(),
                    extension: path.extname(filename).toLowerCase(),
                    language: detectLanguage(filename),
                },
            });
        }

        // Mode 2: Scan and return the tree for the 8 workspace folders
        const tree: WorkspaceFileNode[] = [];

        for (const [folderName, realFolderRelPath] of Object.entries(FOLDER_MAP)) {
            const folderFullPath = path.resolve(workspaceRoot, realFolderRelPath);

            try {
                const stat = await fs.stat(folderFullPath);
                if (stat.isDirectory()) {
                    const children = await scanDirectory(folderFullPath, folderName, 0);
                    tree.push({
                        name: folderName,
                        path: folderName,
                        isDir: true,
                        children,
                    });
                }
            } catch {
                tree.push({
                    name: folderName,
                    path: folderName,
                    isDir: true,
                    children: [],
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                folders: ALLOWED_FOLDERS,
                tree,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to explore workspace files.' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const workspaceRoot = process.cwd();

    try {
        const body = await req.json().catch(() => ({}));
        const virtualPath = (body.path || body.filePath || body.file || '').trim().replace(/^\/+/, '');
        const content = body.content ?? '';

        if (!virtualPath) {
            return NextResponse.json({ success: false, error: 'File path is required.' }, { status: 400 });
        }

        const { safeFullPath, isAllowed } = resolveRealPath(virtualPath, workspaceRoot);
        if (!isAllowed || !safeFullPath) {
            return NextResponse.json(
                { success: false, error: `Invalid path. Files can only be saved in: ${ALLOWED_FOLDERS.join(', ')}` },
                { status: 403 }
            );
        }

        // Ensure parent folder exists
        await fs.mkdir(path.dirname(safeFullPath), { recursive: true });
        await fs.writeFile(safeFullPath, content, 'utf-8');

        const stat = await fs.stat(safeFullPath);
        const filename = path.basename(safeFullPath);

        return NextResponse.json({
            success: true,
            data: {
                path: virtualPath,
                filename,
                sizeBytes: stat.size,
                updatedAt: stat.mtime.toISOString(),
                language: detectLanguage(filename),
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to save workspace file.' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const workspaceRoot = process.cwd();

    try {
        let virtualPath = (req.nextUrl.searchParams.get('file') || '').trim().replace(/^\/+/, '');
        if (!virtualPath) {
            const body = await req.json().catch(() => ({}));
            virtualPath = (body.file || body.path || body.filePath || '').trim().replace(/^\/+/, '');
        }

        if (!virtualPath) {
            return NextResponse.json({ success: false, error: 'File path is required.' }, { status: 400 });
        }

        const { safeFullPath, isAllowed } = resolveRealPath(virtualPath, workspaceRoot);
        if (!isAllowed || !safeFullPath) {
            return NextResponse.json(
                { success: false, error: `Cannot delete files outside of: ${ALLOWED_FOLDERS.join(', ')}` },
                { status: 403 }
            );
        }

        await fs.unlink(safeFullPath);

        return NextResponse.json({
            success: true,
            data: { deletedPath: virtualPath },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to delete workspace file.' },
            { status: 500 }
        );
    }
}
