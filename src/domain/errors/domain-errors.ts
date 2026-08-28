/**
 * Domain Errors
 */

export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class WalletNotSyncedError extends DomainError {
    constructor(percentage?: number) {
        const progress = percentage !== undefined ? `${percentage}%` : 'in progress';
        super(`Wallet is not yet fully synchronized with the Midnight network (${progress}). Please wait until the wallet is fully synced (100%) before executing transactions.`);
    }
}

export class InsufficientDustError extends DomainError {
    constructor(message?: string) {
        super(message || 'Zero DUST balance available. Gas fees for ZK smart contract execution require DUST. Please click "Register for DUST" in the Wallet Studio and allow time for DUST to accrue.');
    }
}

export class InsufficientBalanceError extends DomainError {
    constructor(available: string, required: string) {
        super(`Insufficient tNIGHT balance (Available: ${available}, Required: ${required})`);
    }
}

export class ContractNotFoundError extends DomainError {
    constructor(address?: string) {
        super(address ? `Contract not found at address: ${address}` : 'No contract address specified and no deployment.json found.');
    }
}

export class InvalidInputError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}
