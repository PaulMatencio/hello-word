import type { IWalletGateway } from '@/src/domain/ports/i-wallet.gateway';
import type { DeriveKeysInput, DeriveKeysOutput } from '../dto/use-case-dtos';

export class DeriveKeysUseCase {
    constructor(private readonly walletGateway: IWalletGateway) {}

    async execute(input: DeriveKeysInput): Promise<DeriveKeysOutput> {
        return this.walletGateway.deriveKeys(input.seed);
    }
}
