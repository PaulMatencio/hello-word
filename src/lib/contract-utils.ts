/**
 * Utility functions for contract name sanitization and standardized artifact paths.
 */

/**
 * Extract the clean contract base name from any filename, workspace path, or generated artifact name.
 * Handles cases where the active file or path is:
 * - 'contracts/fungible-token.compact' -> 'fungible-token'
 * - 'fungible-token.compact' -> 'fungible-token'
 * - 'scripts/fungible-token-install.sh' -> 'fungible-token'
 * - 'fungible-token-install.sh' -> 'fungible-token'
 * - 'docs/fungible-token-install.sh-sdk.md' -> 'fungible-token'
 * - 'fungible-token-install.sh-sdk.md' -> 'fungible-token'
 * - 'src/client/counter-sdk.ts' -> 'counter'
 * - 'tests/contracts/fungible-token.test.ts' -> 'fungible-token'
 * - 'examples/fungible-token-example.ts' -> 'fungible-token'
 * - 'FungibleToken.compact' -> 'FungibleToken'
 */
export function getCleanContractBaseName(rawFilenameOrPath?: string | null): string {
    if (!rawFilenameOrPath || !rawFilenameOrPath.trim()) return 'contract';

    // 1. Strip directory paths (both forward and backward slashes)
    let name = rawFilenameOrPath.trim().replace(/\\/g, '/').split('/').pop() || 'contract';

    // 2. Iteratively strip all known extensions and suffixes until stabilized
    let previous = '';
    while (name && name !== previous) {
        previous = name;

        // Strip multi-part compound extensions/suffixes
        name = name
            .replace(/-install\.sh$/i, '')
            .replace(/-architecture\.txt$/i, '')
            .replace(/-notes\.txt$/i, '')
            .replace(/-api\.d\.ts$/i, '')
            .replace(/-types\.ts$/i, '')
            .replace(/-example\.ts$/i, '')
            .replace(/-sdk\.ts$/i, '')
            .replace(/-sdk\.md$/i, '')
            .replace(/\.test\.ts$/i, '')
            .replace(/\.test\.js$/i, '')
            .replace(/\.spec\.ts$/i, '')
            .replace(/\.spec\.js$/i, '')
            .replace(/\.compact$/i, '')
            .replace(/\.d\.ts$/i, '')
            .replace(/\.tsx?$/i, '')
            .replace(/\.jsx?$/i, '')
            .replace(/\.md$/i, '')
            .replace(/\.sh$/i, '')
            .replace(/\.txt$/i, '')
            .replace(/\.json$/i, '');

        // Strip trailing descriptor suffixes if still attached
        name = name
            .replace(/-sdk$/i, '')
            .replace(/-example$/i, '')
            .replace(/-install$/i, '')
            .replace(/-test$/i, '')
            .replace(/-types$/i, '')
            .replace(/-architecture$/i, '')
            .replace(/-notes$/i, '')
            .replace(/-api$/i, '');
    }

    return name.trim() || 'contract';
}

/**
 * Standard artifact path helpers for a given contract.
 */
export const CONTRACT_PATHS = {
    doc: (baseName: string) => `docs/${baseName}-sdk.md`,
    clientSdk: (baseName: string) => `src/client/${baseName}-sdk.ts`,
    example: (baseName: string) => `examples/${baseName}-example.ts`,
    installScript: (baseName: string) => `scripts/${baseName}-install.sh`,
    test: (baseName: string) => `tests/contracts/${baseName}.test.ts`,
    architecture: (baseName: string) => `docs/${baseName}-architecture.txt`,
    notes: (baseName: string) => `docs/${baseName}-notes.txt`,
    types: (baseName: string) => `src/client/${baseName}-types.ts`,
    apiOutline: (baseName: string) => `docs/${baseName}-api.d.ts`,
    contract: (baseName: string) => `contracts/${baseName}.compact`,
};
