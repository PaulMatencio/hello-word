import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/workspace/export-dapp/route';
import { NextRequest } from 'next/server';
import JSZip from 'jszip';

describe('Export DApp Bundle API (/api/workspace/export-dapp)', () => {
    it('returns preview metadata with detected files and tailored prompt for a contract', async () => {
        const req = new NextRequest(
            'http://localhost:3000/api/workspace/export-dapp?contract=fungible-token&preview=true'
        );
        const res = await GET(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.contract).toBe('fungible-token');
        expect(Array.isArray(data.detectedFiles)).toBe(true);
        expect(data.detectedFiles.length).toBeGreaterThan(0);

        // Core required files must be detected
        expect(data.detectedFiles).toContain('contracts/fungible-token.compact');
        expect(data.detectedFiles).toContain('contract/index.d.ts');
        expect(data.detectedFiles).toContain('contract/index.js');

        // Master prompt must mention the contract and Midnight architecture
        expect(data.masterPrompt).toContain('# Midnight Network DApp Frontend Architecture Prompt: FungibleToken');
        expect(data.masterPrompt).toContain('WalletProvider');
        expect(data.masterPrompt).toContain('PublicDataProvider');
        expect(data.masterPrompt).toContain('ProofProvider');
    });

    it('cleans compound filenames when requested', async () => {
        const req = new NextRequest(
            'http://localhost:3000/api/workspace/export-dapp?contract=docs/fungible-token-install.sh-sdk.md&preview=true'
        );
        const res = await GET(req);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.contract).toBe('fungible-token');
    });

    it('generates a valid ZIP archive via POST with custom deployment configuration', async () => {
        const customConfig = {
            contractAddress: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
            networkId: 'testnet-remote',
            indexerUrl: 'https://indexer.testnet.midnight.network/api/v4/graphql',
            proofServerUrl: 'https://prover.testnet.midnight.network',
        };

        const req = new NextRequest('http://localhost:3000/api/workspace/export-dapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contract: 'fungible-token',
                deploymentConfig: customConfig,
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('application/zip');
        expect(res.headers.get('Content-Disposition')).toContain('fungible-token-dapp-bundle.zip');

        // Parse and verify ZIP contents
        const arrayBuffer = await res.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const filenames = Object.keys(zip.files);
        expect(filenames).toContain('contracts/fungible-token.compact');
        expect(filenames).toContain('contract/index.d.ts');
        expect(filenames).toContain('contract/index.js');
        expect(filenames).toContain('deployment.config.json');
        expect(filenames).toContain('GEMINI_DAPP_PROMPT.md');
        expect(filenames).toContain('README.md');

        // Verify deployment.config.json has our custom address
        const configText = await zip.file('deployment.config.json')?.async('text');
        expect(configText).toBeDefined();
        const parsedConfig = JSON.parse(configText!);
        expect(parsedConfig.contractAddress).toBe(customConfig.contractAddress);
        expect(parsedConfig.networkId).toBe('testnet-remote');

        // Verify GEMINI_DAPP_PROMPT.md includes custom address and instructions
        const promptText = await zip.file('GEMINI_DAPP_PROMPT.md')?.async('text');
        expect(promptText).toBeDefined();
        expect(promptText).toContain(customConfig.contractAddress);
    });
});
