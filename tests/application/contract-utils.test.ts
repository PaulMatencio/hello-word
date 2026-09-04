import { describe, it, expect } from 'vitest';
import { getCleanContractBaseName, CONTRACT_PATHS } from '../../src/lib/contract-utils';

describe('getCleanContractBaseName', () => {
    it('cleans simple compact filenames', () => {
        expect(getCleanContractBaseName('fungible-token.compact')).toBe('fungible-token');
        expect(getCleanContractBaseName('counter.compact')).toBe('counter');
        expect(getCleanContractBaseName('FungibleToken.compact')).toBe('FungibleToken');
    });

    it('cleans filenames with directory prefixes', () => {
        expect(getCleanContractBaseName('contracts/fungible-token.compact')).toBe('fungible-token');
        expect(getCleanContractBaseName('contracts\\counter.compact')).toBe('counter');
        expect(getCleanContractBaseName('scripts/fungible-token-install.sh')).toBe('fungible-token');
        expect(getCleanContractBaseName('docs/fungible-token-sdk.md')).toBe('fungible-token');
        expect(getCleanContractBaseName('src/client/counter-sdk.ts')).toBe('counter');
    });

    it('cleans script and installation artifact filenames', () => {
        expect(getCleanContractBaseName('fungible-token-install.sh')).toBe('fungible-token');
        expect(getCleanContractBaseName('FungibleToken-install.sh')).toBe('FungibleToken');
        expect(getCleanContractBaseName('hello-world-install.sh')).toBe('hello-world');
    });

    it('cleans chained compound filenames like fungible-token-install.sh-sdk.md', () => {
        expect(getCleanContractBaseName('docs/fungible-token-install.sh-sdk.md')).toBe('fungible-token');
        expect(getCleanContractBaseName('fungible-token-install.sh-sdk.md')).toBe('fungible-token');
        expect(getCleanContractBaseName('fungible-token-install.sh-sdk.ts')).toBe('fungible-token');
        expect(getCleanContractBaseName('counter-sdk.ts-sdk.md')).toBe('counter');
    });

    it('cleans test and example filenames', () => {
        expect(getCleanContractBaseName('tests/contracts/fungible-token.test.ts')).toBe('fungible-token');
        expect(getCleanContractBaseName('fungible-token.test.ts')).toBe('fungible-token');
        expect(getCleanContractBaseName('examples/fungible-token-example.ts')).toBe('fungible-token');
        expect(getCleanContractBaseName('fungible-token-example.ts')).toBe('fungible-token');
    });

    it('cleans architecture and notes text filenames', () => {
        expect(getCleanContractBaseName('docs/FungibleToken-architecture.txt')).toBe('FungibleToken');
        expect(getCleanContractBaseName('FungibleToken-notes.txt')).toBe('FungibleToken');
    });

    it('handles empty and undefined inputs gracefully', () => {
        expect(getCleanContractBaseName('')).toBe('contract');
        expect(getCleanContractBaseName(null)).toBe('contract');
        expect(getCleanContractBaseName(undefined)).toBe('contract');
    });

    it('generates standard paths properly via CONTRACT_PATHS', () => {
        const base = 'fungible-token';
        expect(CONTRACT_PATHS.doc(base)).toBe('docs/fungible-token-sdk.md');
        expect(CONTRACT_PATHS.clientSdk(base)).toBe('src/client/fungible-token-sdk.ts');
        expect(CONTRACT_PATHS.example(base)).toBe('examples/fungible-token-example.ts');
        expect(CONTRACT_PATHS.installScript(base)).toBe('scripts/fungible-token-install.sh');
        expect(CONTRACT_PATHS.test(base)).toBe('tests/contracts/fungible-token.test.ts');
    });
});
