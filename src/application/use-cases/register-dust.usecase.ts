import type { IWalletGateway } from '@/src/domain/ports/i-wallet.gateway';
import type { RegisterDustInput, RegisterDustOutput } from '../dto/use-case-dtos';

export class RegisterDustUseCase {
    constructor(private readonly walletGateway: IWalletGateway) {}

    async execute(input: RegisterDustInput): Promise<RegisterDustOutput> {
        return this.walletGateway.registerForDust(input.seed);
    }
}
