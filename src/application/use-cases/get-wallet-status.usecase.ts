import type { IWalletGateway } from '@/src/domain/ports/i-wallet.gateway';
import type { GetWalletStatusInput, GetWalletStatusOutput } from '../dto/use-case-dtos';

export class GetWalletStatusUseCase {
    constructor(private readonly walletGateway: IWalletGateway) {}

    async execute(input: GetWalletStatusInput): Promise<GetWalletStatusOutput> {
        return this.walletGateway.getWalletStatus(input.seed);
    }
}
